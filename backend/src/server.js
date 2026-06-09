import app from "./app.js";
import { initDatabase } from "./db/connection.js";

const PORT = 3000;
initDatabase();

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});