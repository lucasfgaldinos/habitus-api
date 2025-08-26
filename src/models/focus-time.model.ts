import { model, Schema } from "mongoose";

const focusTimeSchema = new Schema(
	{
		timeFrom: Date,
		timeTo: Date,
		userId: String,
	},
	{
		versionKey: false,
		timestamps: true,
	},
);

export const FocusTimeModel = model("FocusTime", focusTimeSchema);
