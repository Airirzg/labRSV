# Consolidated Migration

This is a consolidated migration file that combines all previous migrations into a single, well-commented SQL file. This approach provides several benefits:

1. **Improved Readability**: All database schema changes are documented in a single file with clear comments
2. **Easier Maintenance**: Simplifies the migration history and makes it easier to understand the database structure
3. **Better Deployment**: Reduces the number of migration steps needed when deploying to a new environment

## How to Use

When deploying to a new environment, you can use this consolidated migration instead of running all the individual migrations:

```bash
npx prisma migrate resolve --applied consolidated_schema
```

This tells Prisma that this migration has been applied, and it should use this as the baseline for future migrations.

## Original Migrations

This consolidated migration replaces the following original migrations:

- 20250211004341_init
- 20250211010913_update_schema_for_admin_dashboard
- 20250213023601_add_messages
- 20250213195636_add_isdeleted_to_category
- 20250213210140_add_is_deleted_to_equipment
- 20250216201343_add_notes_to_reservation
- 20250216203237_add_message_replies
- 20250216205034_add_user_relation_to_messages
- 20250216205219_add_message_notification_type
- 20250216210417_update_message_reply_relation
- 20250216210844_update_message_thread_relation
- 20250416181257_add_image_urls_to_equipment
- 20250416183704_rename_image_urls_column
- 20250416184140_change_image_urls_to_json
- 20250416191122_init
