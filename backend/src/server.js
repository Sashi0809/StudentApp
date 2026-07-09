"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const classrooms_1 = __importDefault(require("./routes/classrooms"));
const enrollments_1 = __importDefault(require("./routes/enrollments"));
const events_1 = __importDefault(require("./routes/events"));
const departments_1 = __importDefault(require("./routes/departments"));
const timetables_1 = __importDefault(require("./routes/timetables"));
const users_1 = __importDefault(require("./routes/users"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../../uploads')));
app.use('/api/auth', auth_1.default);
app.use('/api/classrooms', classrooms_1.default);
app.use('/api/enrollments', enrollments_1.default);
app.use('/api/events', events_1.default);
app.use('/api/departments', departments_1.default);
app.use('/api/timetables', timetables_1.default);
app.use('/api/users', users_1.default);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map