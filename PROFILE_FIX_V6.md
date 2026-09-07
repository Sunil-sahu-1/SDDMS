# V5 live profile fix

Header and sidebar now call `/api/accounts/me/` after loading cached state. The hard-coded A. Sharma / Investigation Officer profile has been removed. The admin navigation is derived from the actual authenticated role.

After replacing the frontend, restart `npm run dev`, log out/in, and hard-refresh.
