# Admin account setup

Do not hardcode an administrator identity in the frontend. The admin role must be stored on the Django User record.

For the existing `admin` username, run:

```powershell
python manage.py shell
```

Then:

```python
from accounts.models import User
u = User.objects.get(username="admin")
u.role = User.Role.ADMIN
u.is_active = True
u.save(update_fields=["role", "is_active"])
print(u.username, u.role, u.is_active)
```

Exit with `exit()`, restart Django if needed, then log out/in on the frontend and hard refresh. `/api/accounts/me/` should return `role: ADMIN`, and the Administration section will appear.

The V7 frontend also fixes runtime `ReferenceError: user is not defined` crashes in Audit Logs and Cases.
