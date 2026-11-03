revoke all on table public."user" from authenticated;
grant select on table public."user" to authenticated;
grant update (full_name, avatar_url, notify_on_post, daily_summary_enabled)
on table public."user" to authenticated;
