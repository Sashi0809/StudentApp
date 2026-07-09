import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import classroomsRoutes from './routes/classrooms';
import enrollmentsRoutes from './routes/enrollments';
import eventsRoutes from './routes/events';
import departmentsRoutes from './routes/departments';
import timetablesRouter from './routes/timetables';
import classroomsRouter from './routes/classrooms';
import performanceRouter from './routes/performance';
import cgpaRouter from './routes/cgpa';
import complaintsRouter from './routes/complaints';
import meetingsRouter from './routes/meetings';
import semestersRouter from './routes/semesters';
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
app.use('/api/timetables', timetablesRouter);
app.use('/api/classrooms', classroomsRouter);
app.use('/api/performance', performanceRouter);
app.use('/api/cgpa', cgpaRouter);
app.use('/api/complaints', complaintsRouter);
app.use('/api/meetings', meetingsRouter);
app.use('/api/semesters', semestersRouter);
app.use('/api/users', usersRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
