#![cfg(test)]

use super::*;
use soroban_sdk::{Env, testutils::Address as _, Address, String};

#[test]
fn test_medical_report() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, MedicalReportContract);
    let client = MedicalReportContractClient::new(&env, &contract_id);

    let doctor = Address::generate(&env);
    let patient_id = String::from_str(&env, "P-12345");
    let report_hash = String::from_str(&env, "QmHash1234567890");

    client.add_report(&patient_id, &report_hash, &doctor);

    let reports = client.get_reports(&patient_id);
    assert_eq!(reports.len(), 1);
    
    let report = reports.get(0).unwrap();
    assert_eq!(report.doctor, doctor);
    assert_eq!(report.report_hash, report_hash);

    let is_valid = client.verify_report(&patient_id, &report_hash);
    assert!(is_valid);

    let invalid_hash = String::from_str(&env, "QmFakeHash");
    let is_valid_fake = client.verify_report(&patient_id, &invalid_hash);
    assert!(!is_valid_fake);
}
