import mongoose from "mongoose";

const circuitoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
    },
    atractivos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Atractivo",
      },
    ],
  },
  {
    collection: "circuitos",
    timestamps: true,
  }
);

export default mongoose.models.Circuito ||
  mongoose.model("Circuito", circuitoSchema);
