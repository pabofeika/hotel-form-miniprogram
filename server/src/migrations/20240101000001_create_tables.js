/**
 * Initial schema for hotel form mini program
 * Creates all 10 tables
 */
exports.up = function (knex) {
  return knex.schema
    // 1. users
    .createTable('users', (table) => {
      table.increments('id').primary();
      table.string('openid', 100).notNullable().unique();
      table.string('nickname', 100);
      table.string('avatar', 500);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.index('openid', 'idx_users_openid');
    })

    // 2. admins
    .createTable('admins', (table) => {
      table.increments('id').primary();
      table.string('username', 50).notNullable().unique();
      table.string('password_hash', 255).notNullable();
      table.enu('role', ['superadmin', 'admin']).defaultTo('admin');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })

    // 3. form_templates
    .createTable('form_templates', (table) => {
      table.increments('id').primary();
      table.string('title', 200).notNullable();
      table.text('description');
      table.enu('status', ['draft', 'published', 'unpublished']).defaultTo('draft');
      table.string('version', 20).defaultTo('1.0');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })

    // 4. form_steps
    .createTable('form_steps', (table) => {
      table.increments('id').primary();
      table.integer('template_id').unsigned().notNullable()
        .references('id').inTable('form_templates').onDelete('CASCADE');
      table.integer('step_number').notNullable();
      table.string('title', 200).notNullable();
      table.text('description');
    })

    // 5. form_fields
    .createTable('form_fields', (table) => {
      table.increments('id').primary();
      table.integer('step_id').unsigned().notNullable()
        .references('id').inTable('form_steps').onDelete('CASCADE');
      table.string('field_key', 100).notNullable();
      table.string('label', 200).notNullable();
      table.string('field_type', 50).notNullable();
      table.boolean('is_required').defaultTo(false);
      table.string('placeholder', 500);
      table.text('help_text');
      table.text('options');       // JSON for select/multi_select options
      table.text('validation');    // JSON for validation rules
      table.text('conditions');    // JSON for conditional display logic
      table.integer('sort_order').defaultTo(0);
    })

    // 6. records
    .createTable('records', (table) => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable()
        .references('id').inTable('users').onDelete('CASCADE');
      table.integer('form_template_id').unsigned().notNullable()
        .references('id').inTable('form_templates').onDelete('CASCADE');
      table.string('record_sn', 50).notNullable().unique();
      table.enu('status', ['draft', 'submitted', 'reviewing', 'approved', 'rejected']).defaultTo('draft');
      table.integer('current_step').defaultTo(1);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.index('user_id', 'idx_records_user');
      table.index('status', 'idx_records_status');
    })

    // 7. record_values
    .createTable('record_values', (table) => {
      table.increments('id').primary();
      table.integer('record_id').unsigned().notNullable()
        .references('id').inTable('records').onDelete('CASCADE');
      table.integer('field_id').unsigned().notNullable();
      table.text('value');
      table.string('attachment_url', 500);
    })

    // 8. feedback
    .createTable('feedback', (table) => {
      table.increments('id').primary();
      table.integer('record_id').unsigned().notNullable()
        .references('id').inTable('records').onDelete('CASCADE');
      table.integer('admin_id').unsigned().notNullable()
        .references('id').inTable('admins').onDelete('CASCADE');
      table.text('content').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })

    // 9. notification_logs
    .createTable('notification_logs', (table) => {
      table.increments('id').primary();
      table.integer('record_id').unsigned().notNullable()
        .references('id').inTable('records').onDelete('CASCADE');
      table.integer('user_id').unsigned().notNullable()
        .references('id').inTable('users').onDelete('CASCADE');
      table.string('template_id', 100);
      table.string('subscription_status', 50);
      table.text('send_result');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })

    // 10. attachments
    .createTable('attachments', (table) => {
      table.increments('id').primary();
      table.integer('record_id').unsigned()
        .references('id').inTable('records').onDelete('SET NULL');
      table.integer('user_id').unsigned().notNullable()
        .references('id').inTable('users').onDelete('CASCADE');
      table.string('file_name', 255).notNullable();
      table.string('file_path', 500).notNullable();
      table.integer('file_size').defaultTo(0);
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('attachments')
    .dropTableIfExists('notification_logs')
    .dropTableIfExists('feedback')
    .dropTableIfExists('record_values')
    .dropTableIfExists('records')
    .dropTableIfExists('form_fields')
    .dropTableIfExists('form_steps')
    .dropTableIfExists('form_templates')
    .dropTableIfExists('admins')
    .dropTableIfExists('users');
};
