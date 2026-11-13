import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// One review per student per event
reviewSchema.index({ student: 1, event: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
