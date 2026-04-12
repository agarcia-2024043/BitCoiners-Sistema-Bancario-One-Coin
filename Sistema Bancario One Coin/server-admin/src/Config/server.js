import app from "../app.js";
import { connectDB } from "./database.js";

const PORT = 3000;

connectDB();

app.listen(PORT, () => {
    console.log(`servidor corriendo en ${PORT}`);
});
