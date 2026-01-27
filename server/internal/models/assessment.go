package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Assessment represents a client's fitness assessment
type Assessment struct {
	ID        uuid.UUID      `json:"id" gorm:"type:uuid;primary_key"`
	ClientID  uuid.UUID      `json:"client_id" gorm:"type:uuid;not null"`
	Client    Client         `json:"-" gorm:"foreignKey:ClientID"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// PARQ Test (true = yes, false = no)
	ParqHeartProblem     bool `json:"parq_heart_problem"`
	ParqChestPain        bool `json:"parq_chest_pain"`
	ParqDizziness        bool `json:"parq_dizziness"`
	ParqChronicCondition bool `json:"parq_chronic_condition"`
	ParqMedication       bool `json:"parq_medication"`
	ParqBoneJoint        bool `json:"parq_bone_joint"`
	ParqSupervision      bool `json:"parq_supervision"`

	// Posture Analysis (1=Poor, 2=Fair, 3=Good)
	PostureHeadNeck  int `json:"posture_head_neck"`
	PostureShoulders int `json:"posture_shoulders"`
	PostureLPHC      int `json:"posture_lphc"`
	PostureKnee      int `json:"posture_knee"`
	PostureFoot      int `json:"posture_foot"`

	// Movement Tests - Push Up (1=Poor, 2=Fair, 3=Good)
	PushUpForm     int `json:"pushup_form"`
	PushUpScapular int `json:"pushup_scapular"`
	PushUpLordosis int `json:"pushup_lordosis"`
	PushUpHeadPos  int `json:"pushup_head_pos"`

	// Movement Tests - Squat (1=Poor, 2=Fair, 3=Good)
	SquatFeetOut     int `json:"squat_feet_out"`
	SquatKneesIn     int `json:"squat_knees_in"`
	SquatLowerBack   int `json:"squat_lower_back"`
	SquatArmsForward int `json:"squat_arms_forward"`
	SquatLeanForward int `json:"squat_lean_forward"`

	// Movement Tests - Single Leg Balance (1=Poor, 2=Fair, 3=Good)
	BalanceCorrect int `json:"balance_correct"`
	BalanceKneeIn  int `json:"balance_knee_in"`
	BalanceHipRise int `json:"balance_hip_rise"`

	// Movement Tests - Shoulder Mobility (1=Poor, 2=Fair, 3=Good)
	ShoulderRetraction  int `json:"shoulder_retraction"`
	ShoulderProtraction int `json:"shoulder_protraction"`
	ShoulderElevation   int `json:"shoulder_elevation"`
	ShoulderDepression  int `json:"shoulder_depression"`

	// Notes
	Notes string `json:"notes"`
}

// BeforeCreate generates UUID before creating
func (a *Assessment) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return nil
}

// CreateAssessmentRequest is the request body for creating an assessment
type CreateAssessmentRequest struct {
	// PARQ Test
	ParqHeartProblem     bool `json:"parq_heart_problem"`
	ParqChestPain        bool `json:"parq_chest_pain"`
	ParqDizziness        bool `json:"parq_dizziness"`
	ParqChronicCondition bool `json:"parq_chronic_condition"`
	ParqMedication       bool `json:"parq_medication"`
	ParqBoneJoint        bool `json:"parq_bone_joint"`
	ParqSupervision      bool `json:"parq_supervision"`

	// Posture Analysis
	PostureHeadNeck  int `json:"posture_head_neck"`
	PostureShoulders int `json:"posture_shoulders"`
	PostureLPHC      int `json:"posture_lphc"`
	PostureKnee      int `json:"posture_knee"`
	PostureFoot      int `json:"posture_foot"`

	// Push Up
	PushUpForm     int `json:"pushup_form"`
	PushUpScapular int `json:"pushup_scapular"`
	PushUpLordosis int `json:"pushup_lordosis"`
	PushUpHeadPos  int `json:"pushup_head_pos"`

	// Squat
	SquatFeetOut     int `json:"squat_feet_out"`
	SquatKneesIn     int `json:"squat_knees_in"`
	SquatLowerBack   int `json:"squat_lower_back"`
	SquatArmsForward int `json:"squat_arms_forward"`
	SquatLeanForward int `json:"squat_lean_forward"`

	// Balance
	BalanceCorrect int `json:"balance_correct"`
	BalanceKneeIn  int `json:"balance_knee_in"`
	BalanceHipRise int `json:"balance_hip_rise"`

	// Shoulder
	ShoulderRetraction  int `json:"shoulder_retraction"`
	ShoulderProtraction int `json:"shoulder_protraction"`
	ShoulderElevation   int `json:"shoulder_elevation"`
	ShoulderDepression  int `json:"shoulder_depression"`

	Notes string `json:"notes"`
}

// TotalScore calculates the total posture and movement score
func (a *Assessment) TotalScore() int {
	return a.PostureHeadNeck + a.PostureShoulders + a.PostureLPHC + a.PostureKnee + a.PostureFoot
}

// ScoreLevel returns the assessment level based on score
func (a *Assessment) ScoreLevel() string {
	score := a.TotalScore()
	if score <= 6 {
		return "poor"
	} else if score <= 12 {
		return "fair"
	}
	return "good"
}
