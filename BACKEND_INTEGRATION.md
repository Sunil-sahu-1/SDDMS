# SDDMS frontend ↔ Django integration

The frontend now targets the verified Django account administration routes:

- `GET /api/accounts/users/`
- `PATCH /api/accounts/users/<id>/`
- `DELETE /api/accounts/users/<id>/`
- `PATCH /api/accounts/users/<id>/role/`
- `PATCH /api/accounts/users/<id>/status/`
- `GET /api/accounts/verifications/`
- `POST /api/accounts/verifications/<id>/approve/`
- `POST /api/accounts/verifications/<id>/reject/`
- `GET /api/accounts/me/`

## Important backend routing fix

The current Django repository contains a `dashboard` app and `dashboard/urls.py`, but the current `config/urls.py` does not include it. To enable the live Admin Control Center statistics, add this import route to `config/urls.py`:

```python
path("api/admin/dashboard/", include("dashboard.urls")),
```

Place it with the other `api/...` includes.

The dashboard endpoint is admin-only and returns users, verification, cases, investigations, complaints, documents, evidence, legal and security statistics plus recent activity. The frontend intentionally falls back to safe empty states when that endpoint is unavailable; it does not fabricate live counts.

## Environment

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
```
