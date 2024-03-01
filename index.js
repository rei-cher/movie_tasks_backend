const express = require('express');
const {Pool} = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

//DB connection
const pool = new Pool({
    user: process.env.DB_USER,    
    host: process.env.DB_HOST,    
    database: process.env.DB_DATABASE,    
    password: process.env.DB_PASSWORD,  
});

app.use(cors());
app.use(express.json());

app.post('/api/watch-later', async (req, res) => {
    const {email, movieId, movieData} = req.body;
    try{        
        await pool.query('Insert into movies (movie_id, movie_data) values ($1, $2) on conflict (movie_id) do nothing;', [movieId, movieData]);
        await pool.query('Insert into watch_later (email, movie_id) values ($1, $2) on conflict (email, movie_id) do nothing;', [email, movieId]);
        await pool.query('Delete from watching_now where email = $1 and movie_id = $2;', [email, movieId]);
        await pool.query('Delete from watched where email = $1 and movie_id = $2;', [email, movieId]);
        res.json({message: 'Movie added to watch later'});
    } catch(err){
        console.log('Server error: ', err);
        res.status(500).send('Server error');
    }
});

app.post('/api/watching', async (req, res) => {
    const {email, movieId, movieData} = req.body;
    try{
        await pool.query('Insert into movies (movie_id, movie_data) values ($1, $2) on conflict (movie_id) do nothing;', [movieId, movieData]);
        await pool.query('Insert into watching_now (email, movie_id) values ($1, $2) on conflict (email, movie_id) do nothing;', [email, movieId]);
        await pool.query('Delete from watch_later where email = $1 and movie_id = $2;', [email, movieId]);
        await pool.query('Delete from watched where email = $1 and movie_id = $2;', [email, movieId]);
        res.json({message: 'Movie added to watching now'});
    } catch(err){
        console.log('Server error: ', err);
        res.status(500).send('Server error');
    }
})

app.post('/api/watched', async (req, res) => {
    const {email, movieId, movieData} = req.body;
    try{        
        await pool.query('Insert into movies (movie_id, movie_data) values ($1, $2) on conflict (movie_id) do nothing;', [movieId, movieData]);
        await pool.query('Insert into watched (email, movie_id) values ($1, $2) on conflict (email, movie_id) do nothing;', [email, movieId]);
        await pool.query('Delete from watch_later where email = $1 and movie_id = $2;', [email, movieId]);
        await pool.query('Delete from watching_now where email = $1 and movie_id = $2;', [email, movieId]);
        res.json({message: 'Movie added to watched'});
    } catch(err){
        console.log('Server error: ', err);
        res.status(500).send('Server error');
    }
})

app.get('/api/watch-later/:email', async (req, res) => {
    const {email} = req.params;
    try{
        const query = 'select movie_data from movies inner join watch_later on movies.movie_id = watch_later.movie_id where watch_later.email = $1;';
        const {rows} = await pool.query(query,[email]);
        res.json(rows);
    } catch (err){
        console.log("Server error: ", err);
        res.status(500).send('Server Error');
    }
});

app.get('/api/watching-now/:email', async (req, res) => {
    const {email} = req.params;
    try{
        const query = 'select movie_data from movies inner join watching_now on movies.movie_id = watching_now.movie_id where watching_now.email = $1;';
        const {rows} = await pool.query(query,[email]);
        res.json(rows);
    } catch (err){
        console.log("Server error: ", err);
        res.status(500).send('Server Error');
    }
});

app.get('/api/watched/:email', async (req, res) => {
    const {email} = req.params;
    try{
        const query = 'select movie_data from movies inner join watched on movies.movie_id = watched.movie_id where watched.email = $1;';
        const {rows} = await pool.query(query,[email]);
        res.json(rows);
    } catch (err){
        console.log("Server error: ", err);
        res.status(500).send('Server Error');
    }
});

app.listen(5000, () => console.log(`Server running on port 5000`));