import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
  protected tableName = 'exercises_master';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary();
      table.string('exercise', 255).notNullable();
      table.string('short_youtube_demonstration', 255);
      table.string('in_depth_youtube_technique', 255);
      table.string('difficulty_level', 255);
      table.string('muscle_group', 255);
      table.string('prime_mover_muscle', 255);
      table.string('secondary_muscle', 255);
      table.string('tertiary_muscle', 255);
      table.string('primary_equipment', 255);
      table.integer('primary_items');
      table.string('secondary_equipment', 255);
      table.string('secondary_items', 255);
      table.string('posture', 255);
      table.string('single_or_double_arm', 255);
      table.string('continuous_or_alternating_arms', 255);
      table.string('grip', 255);
      table.string('load_position_ending', 255);
      table.string('combination_exercises', 255);
      table.string('movement_pattern_1', 255);
      table.string('movement_pattern_2', 255);
      table.string('movement_pattern_3', 255);
      table.string('plane_of_motion_1', 255);
      table.string('plane_of_motion_2', 255);
      table.string('plane_of_motion_3', 255);
      table.string('mechanics', 255);
      table.string('terms_of_laterality', 255);
      table.string('exercise_classification', 255);

      table.timestamps(true);
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
