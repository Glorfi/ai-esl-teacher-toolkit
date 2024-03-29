import express from 'express';
import { router } from './routes/index.js';
import { errors } from 'celebrate';
import cors from 'cors';
const app = express();
app.use(express.json());
app.use(cors());
app.get('/', (req, res) => {
    res.send('The server is up and running!');
});
app.use('/api', router); // тут позже добавить env
app.use(errors());
app.use((err, req, res, next) => {
    if (err.statusCode) {
        res
            .status(err.statusCode)
            .json({ message: err.message, code: err.statusCode });
    }
    else {
        res.status(500).json(err);
    }
    next(err);
});
app.listen({ port: 5050 }, () => {
    console.log(`Server is running at http://localhost:5050`);
});
export default app;
//# sourceMappingURL=index.js.map