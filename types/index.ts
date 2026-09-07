export type ApiRecord = Record<string, unknown> & { id?: string|number };
export type CaseRecord = ApiRecord & { case_number?: string; title?: string; status?: string; priority?: string; description?: string; assigned_officer?: string };
export type DocumentRecord = ApiRecord & { title?: string; name?: string; document_type?: string; status?: string; case_number?: string; integrity_status?: string; created_at?: string };
export type EvidenceRecord = ApiRecord & { title?: string; evidence_number?: string; status?: string; case_number?: string; evidence_type?: string };
