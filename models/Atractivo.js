import mongoose from "mongoose";

const imagenSchema = new mongoose.Schema(
  {
    public_id: {
      type: String,
      trim: true,
    },
    url: {
      type: String,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const atractivoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    departamento: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
    },
    imagen: {
      type: imagenSchema,
      default: null,
    },
    circuito: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Circuito",
      required: true,
    },
    youtubeUrl: {
      type: String,
      trim: true,
    },
    googleMapsUrl: {
      type: String,
      trim: true,
    },
  },
  {
    collection: "atractivos",
    timestamps: true,
  }
);

export default mongoose.models.Atractivo ||
  mongoose.model("Atractivo", atractivoSchema);
