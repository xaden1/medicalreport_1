#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Env, String, Address, Vec, Map};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ReportRecord {
    pub doctor: Address,
    pub report_hash: String,
    pub timestamp: u64,
    pub description: String,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PatientIdentity {
    pub patient_id: String,
    pub owner: Address,
    pub created_at: u64,
    pub blood_type: String,
    pub allergies: String,
    pub emergency_contact: String,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PrivacyGrant {
    pub grantee: Address,
    pub granted_at: u64,
    pub expiry: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct InsuranceClaim {
    pub claim_id: String,
    pub patient_id: String,
    pub insurance_provider: Address,
    pub status: String,
    pub created_at: u64,
    pub verified: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ResearchConsent {
    pub patient_id: String,
    pub research_id: String,
    pub consented: bool,
    pub anonymized: bool,
    pub created_at: u64,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Reports(String),
    PatientIdentity(String),
    PatientOwner(String),
    PrivacyGrants(String),
    InsuranceClaims(String),
    ResearchConsents(String),
}

#[contract]
pub struct MedicalReportContract;

#[contractimpl]
impl MedicalReportContract {
    pub fn add_report(env: Env, patient_id: String, report_hash: String, doctor: Address, description: String) {
        doctor.require_auth();
        
        let key = DataKey::Reports(patient_id.clone());
        let mut patient_reports: Vec<ReportRecord> = env.storage().persistent().get(&key).unwrap_or(Vec::new(&env));
        
        patient_reports.push_back(ReportRecord {
            doctor,
            report_hash,
            timestamp: env.ledger().timestamp(),
            description,
        });

        env.storage().persistent().set(&key, &patient_reports);
    }

    pub fn get_reports(env: Env, patient_id: String) -> Vec<ReportRecord> {
        let key = DataKey::Reports(patient_id);
        env.storage().persistent().get(&key).unwrap_or(Vec::new(&env))
    }

    pub fn verify_report(env: Env, patient_id: String, report_hash: String) -> bool {
        let key = DataKey::Reports(patient_id);
        let patient_reports: Vec<ReportRecord> = env.storage().persistent().get(&key).unwrap_or(Vec::new(&env));
        
        for index in 0..patient_reports.len() {
            let report = patient_reports.get(index).unwrap();
            if report.report_hash == report_hash {
                return true;
            }
        }
        false
    }

    pub fn register_patient_identity(env: Env, patient_id: String, owner: Address, blood_type: String, allergies: String, emergency_contact: String) {
        owner.require_auth();
        
        let identity = PatientIdentity {
            patient_id: patient_id.clone(),
            owner: owner.clone(),
            created_at: env.ledger().timestamp(),
            blood_type,
            allergies,
            emergency_contact,
        };
        
        let id_key = DataKey::PatientIdentity(patient_id.clone());
        let owner_key = DataKey::PatientOwner(patient_id);
        
        env.storage().persistent().set(&id_key, &identity);
        env.storage().persistent().set(&owner_key, &owner);
    }

    pub fn get_patient_identity(env: Env, patient_id: String) -> PatientIdentity {
        let key = DataKey::PatientIdentity(patient_id);
        env.storage().persistent().get(&key).unwrap_or_else(|| PatientIdentity {
            patient_id: String::from_str(&env, ""),
            owner: env.current_contract_address(),
            created_at: 0,
            blood_type: String::from_str(&env, ""),
            allergies: String::from_str(&env, ""),
            emergency_contact: String::from_str(&env, ""),
        })
    }

    pub fn grant_privacy_access(env: Env, patient_id: String, grantee: Address, days_valid: u64) {
        let owner_key = DataKey::PatientOwner(patient_id.clone());
        let owner: Address = env.storage().persistent().get(&owner_key).unwrap();
        owner.require_auth();
        
        let grant = PrivacyGrant {
            grantee,
            granted_at: env.ledger().timestamp(),
            expiry: env.ledger().timestamp() + (days_valid * 86400),
        };
        
        let grants_key = DataKey::PrivacyGrants(patient_id);
        env.storage().persistent().set(&grants_key, &grant);
    }

    pub fn verify_privacy_access(env: Env, patient_id: String, requester: Address) -> bool {
        let grants_key = DataKey::PrivacyGrants(patient_id);
        if let Some(grant) = env.storage().persistent().get::<_, PrivacyGrant>(&grants_key) {
            return grant.grantee == requester && grant.expiry > env.ledger().timestamp();
        }
        false
    }

    pub fn get_medical_timeline(env: Env, patient_id: String) -> Vec<ReportRecord> {
        let key = DataKey::Reports(patient_id);
        let mut reports: Vec<ReportRecord> = env.storage().persistent().get(&key).unwrap_or(Vec::new(&env));
        
        for i in 0..reports.len() {
            for j in (i + 1)..reports.len() {
                let report_i = reports.get(i).unwrap();
                let report_j = reports.get(j).unwrap();
                if report_i.timestamp < report_j.timestamp {
                    let temp = report_i.clone();
                    reports.set(i, report_j.clone());
                    reports.set(j, temp);
                }
            }
        }
        
        reports
    }

    pub fn register_insurance_claim(env: Env, claim_id: String, patient_id: String, insurance_provider: Address) {
        insurance_provider.require_auth();
        
        let claim = InsuranceClaim {
            claim_id: claim_id.clone(),
            patient_id,
            insurance_provider,
            status: String::from_str(&env, "pending"),
            created_at: env.ledger().timestamp(),
            verified: false,
        };
        
        let claims_key = DataKey::InsuranceClaims(claim_id);
        env.storage().persistent().set(&claims_key, &claim);
    }

    pub fn verify_insurance_claim(env: Env, claim_id: String, patient_id: String, report_hash: String) -> bool {
        let is_report_valid = Self::verify_report(env.clone(), patient_id, report_hash);
        
        if is_report_valid {
            let claims_key = DataKey::InsuranceClaims(claim_id.clone());
            if let Some(mut claim) = env.storage().persistent().get::<_, InsuranceClaim>(&claims_key) {
                claim.verified = true;
                claim.status = String::from_str(&env, "approved");
                env.storage().persistent().set(&claims_key, &claim);
                return true;
            }
        }
        false
    }

    pub fn register_research_consent(env: Env, patient_id: String, research_id: String, anonymized: bool) {
        let owner_key = DataKey::PatientOwner(patient_id.clone());
        let owner: Address = env.storage().persistent().get(&owner_key).unwrap();
        owner.require_auth();
        
        let consent = ResearchConsent {
            patient_id,
            research_id: research_id.clone(),
            consented: true,
            anonymized,
            created_at: env.ledger().timestamp(),
        };
        
        let consent_key = DataKey::ResearchConsents(research_id);
        env.storage().persistent().set(&consent_key, &consent);
    }
}

mod test;
