import { model, Schema } from "mongoose";

const habitSchema = new Schema(
	{
		name: String,
		completedDates: [Date],
		userId: String,
	},
	{
		versionKey: false,
		timestamps: true,
	},
);

export const HabitModel = model("Habit", habitSchema);
