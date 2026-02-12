from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from ..database import get_db
from ..auth import get_current_user
from .. import models

router = APIRouter(prefix="/api", tags=["WoofTrain"])


# ---- Schemas ----

class StartProgram(BaseModel):
    dog_id: int
    program_id: int


# ---- Programs ----

@router.get("/training/programs")
def list_programs(
    difficulty: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(models.TrainingProgram)
    if difficulty:
        query = query.filter(models.TrainingProgram.difficulty == difficulty)
    if category:
        query = query.filter(models.TrainingProgram.category == category)
    programs = query.order_by(models.TrainingProgram.title).all()
    return [
        {
            "id": p.id,
            "title": p.title,
            "description": p.description,
            "difficulty": p.difficulty,
            "category": p.category,
            "duration_weeks": p.duration_weeks,
            "image_url": p.image_url,
        }
        for p in programs
    ]


@router.get("/training/programs/{program_id}")
def get_program_detail(
    program_id: int,
    db: Session = Depends(get_db),
):
    program = db.query(models.TrainingProgram).filter(
        models.TrainingProgram.id == program_id
    ).first()
    if not program:
        raise HTTPException(status_code=404, detail="Programme non trouve")
    steps = (
        db.query(models.TrainingStep)
        .filter(models.TrainingStep.program_id == program_id)
        .order_by(models.TrainingStep.step_number)
        .all()
    )
    steps_list = [
        {
            "id": s.id,
            "step_number": s.step_number,
            "title": s.title,
            "description": s.description,
            "tips": s.tips,
            "duration_minutes": s.duration_minutes,
        }
        for s in steps
    ]
    return {
        "id": program.id,
        "title": program.title,
        "description": program.description,
        "difficulty": program.difficulty,
        "category": program.category,
        "duration_weeks": program.duration_weeks,
        "image_url": program.image_url,
        "steps": steps_list,
    }


# ---- Progress ----

@router.post("/training/start")
def start_program(
    data: StartProgram,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    dog = db.query(models.Dog).filter(
        models.Dog.id == data.dog_id, models.Dog.owner_id == current_user.id
    ).first()
    if not dog:
        raise HTTPException(status_code=404, detail="Chien non trouve")
    program = db.query(models.TrainingProgram).filter(
        models.TrainingProgram.id == data.program_id
    ).first()
    if not program:
        raise HTTPException(status_code=404, detail="Programme non trouve")
    existing = db.query(models.UserTrainingProgress).filter(
        models.UserTrainingProgress.user_id == current_user.id,
        models.UserTrainingProgress.dog_id == data.dog_id,
        models.UserTrainingProgress.program_id == data.program_id,
        models.UserTrainingProgress.completed == False,
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Ce programme est deja en cours pour ce chien",
        )
    progress = models.UserTrainingProgress(
        user_id=current_user.id,
        dog_id=data.dog_id,
        program_id=data.program_id,
        current_step=1,
    )
    db.add(progress)
    db.commit()
    db.refresh(progress)
    return {
        "id": progress.id,
        "user_id": progress.user_id,
        "dog_id": progress.dog_id,
        "program_id": progress.program_id,
        "current_step": progress.current_step,
        "completed": progress.completed,
        "started_at": progress.started_at.isoformat() if progress.started_at else None,
    }


@router.get("/training/progress/{dog_id}")
def get_progress(
    dog_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    dog = db.query(models.Dog).filter(
        models.Dog.id == dog_id, models.Dog.owner_id == current_user.id
    ).first()
    if not dog:
        raise HTTPException(status_code=404, detail="Chien non trouve")
    progress_list = (
        db.query(models.UserTrainingProgress)
        .filter(
            models.UserTrainingProgress.user_id == current_user.id,
            models.UserTrainingProgress.dog_id == dog_id,
        )
        .order_by(models.UserTrainingProgress.started_at.desc())
        .all()
    )
    results = []
    for prog in progress_list:
        program = db.query(models.TrainingProgram).filter(
            models.TrainingProgram.id == prog.program_id
        ).first()
        total_steps = (
            db.query(models.TrainingStep)
            .filter(models.TrainingStep.program_id == prog.program_id)
            .count()
        )
        # Determine status
        if prog.completed:
            status = "completed"
        else:
            status = "in_progress"

        results.append({
            "id": prog.id,
            "program_id": prog.program_id,
            "program_name": program.title if program else None,
            "program_title": program.title if program else None,
            "difficulty": program.difficulty if program else None,
            "program_difficulty": program.difficulty if program else None,
            "current_step": prog.current_step,
            "total_steps": total_steps,
            "completed": prog.completed,
            "status": status,
            "started_at": prog.started_at.isoformat() if prog.started_at else None,
            "completed_at": prog.completed_at.isoformat() if prog.completed_at else None,
        })
    return results


@router.put("/training/progress/{progress_id}/advance")
def advance_step(
    progress_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    progress = db.query(models.UserTrainingProgress).filter(
        models.UserTrainingProgress.id == progress_id,
        models.UserTrainingProgress.user_id == current_user.id,
    ).first()
    if not progress:
        raise HTTPException(status_code=404, detail="Progression non trouvee")
    if progress.completed:
        raise HTTPException(
            status_code=400, detail="Programme deja termine"
        )
    total_steps = (
        db.query(models.TrainingStep)
        .filter(models.TrainingStep.program_id == progress.program_id)
        .count()
    )
    if progress.current_step >= total_steps:
        progress.completed = True
        progress.completed_at = datetime.utcnow()
        db.commit()
        return {
            "id": progress.id,
            "current_step": progress.current_step,
            "total_steps": total_steps,
            "completed": True,
            "completed_at": progress.completed_at.isoformat(),
            "message": "Programme termine !",
        }
    else:
        progress.current_step += 1
        db.commit()
        return {
            "id": progress.id,
            "current_step": progress.current_step,
            "total_steps": total_steps,
            "completed": False,
            "message": f"Etape {progress.current_step}/{total_steps}",
        }


@router.get("/train/my-progress")
def get_my_progress(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all training progress for the current user across all dogs"""
    progress_list = (
        db.query(models.UserTrainingProgress)
        .filter(models.UserTrainingProgress.user_id == current_user.id)
        .order_by(models.UserTrainingProgress.started_at.desc())
        .all()
    )
    results = []
    for prog in progress_list:
        program = db.query(models.TrainingProgram).filter(
            models.TrainingProgram.id == prog.program_id
        ).first()
        dog = db.query(models.Dog).filter(
            models.Dog.id == prog.dog_id
        ).first()
        total_steps = (
            db.query(models.TrainingStep)
            .filter(models.TrainingStep.program_id == prog.program_id)
            .count()
        )
        # Determine status
        if prog.completed:
            status = "completed"
        else:
            status = "in_progress"

        results.append({
            "id": prog.id,
            "program_id": prog.program_id,
            "program_name": program.title if program else None,
            "difficulty": program.difficulty if program else None,
            "dog_name": dog.name if dog else None,
            "current_step": prog.current_step,
            "total_steps": total_steps,
            "completed": prog.completed,
            "status": status,
            "started_at": prog.started_at.isoformat() if prog.started_at else None,
            "completed_at": prog.completed_at.isoformat() if prog.completed_at else None,
        })
    return results


@router.delete("/training/progress/{progress_id}")
def abandon_program(
    progress_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    progress = db.query(models.UserTrainingProgress).filter(
        models.UserTrainingProgress.id == progress_id,
        models.UserTrainingProgress.user_id == current_user.id,
    ).first()
    if not progress:
        raise HTTPException(status_code=404, detail="Progression non trouvee")
    db.delete(progress)
    db.commit()
    return {"status": "abandoned"}
