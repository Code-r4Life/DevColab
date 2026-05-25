import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP Server layer to anchor both Express and Socket.io pipelines cohesion
const httpServer = createServer(app);

// Initialize Socket.io Engine on top of the HTTP abstraction layer instances
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }
});

// Real-time Event Channel Handlers
io.on('connection', (socket) => {
  console.log(`🔌 Client connected to Socket stream context: ${socket.id}`);
  
  socket.on('join:project', (projectId) => {
    socket.join(projectId);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected from Socket stream: ${socket.id}`);
  });
});

// Essential Middleware Layers
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// 🛠️ Dynamic Route Mount Handler
const mountRouteSafely = async (routePrefix, modulePath) => {
  try {
    const routeModule = await import(modulePath);
    app.use(routePrefix, routeModule.default || routeModule);
    console.log(`✅ Successfully mounted API route: ${routePrefix}`);
  } catch (err) {
    console.error(`❌ ROUTE CONFIGURATION CRASH at prefix "${routePrefix}": ${err.message}`);
  }
};

const initializeRoutes = async () => {
  await mountRouteSafely('/api/auth', './routes/auth.routes.js');
  await mountRouteSafely('/api/tasks', './routes/task.routes.js');
  await mountRouteSafely('/api/projects', './routes/project.routes.js');
  await mountRouteSafely('/api/notifications', './routes/notification.routes.js');
  await mountRouteSafely('/api/workspaces', './routes/workspace.routes.js');
  await mountRouteSafely('/api/activity', './routes/activity.routes.js'); // 💡 Mounted Activity tracking route!
};

initializeRoutes();

if (!process.env.MONGO_URI) {
  console.error("❌ Critical Missing Variable: MONGO_URI is missing inside your .env container!");
  process.exit(1);
}

// Global Exception Fallback Pipeline
app.use((err, req, res, next) => {
  console.error("❌ Express Pipeline Error:", err.message);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("🚀 MongoDB connected successfully to database cluster context.");
    // CRITICAL UPDATE: Listen through httpServer instead of app.listen!
    httpServer.listen(PORT, () => {
      console.log(`📡 DevCollab Express server is listening live on port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection error caught on initialization:", err);
    process.exit(1);
  });

export default app;