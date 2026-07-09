import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import classroomsRoutes from './routes/classrooms';
import enrollmentsRoutes from './routes/enrollments';
import eventsRoutes from './routes/events';
import departmentsRoutes from './routes/departments';
import timetablesRoutes from './routes/timetables';
import usersRoutes from './routes/users';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/classrooms', classroomsRoutes);
app.use('/api/enrollments', enrollmentsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/timetables', timetablesRoutes);
app.use('/api/users', usersRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
