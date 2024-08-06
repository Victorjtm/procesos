const express = require('express');
const router = express.Router();

router.route('/:id')
    .get((req, res) => {
        res.json({ msg: 'consulta un usuario' });
    })
    .post((req, res) => {
        res.json({ msg: 'ingreso usuarios' });
    })
    .put((req, res) => {
        res.json({ msg: 'modifica todo el usuario' });
    })
    .patch((req, res) => {
        res.json({ msg: 'modifica parte del usuario' });
    })
    .delete((req, res) => {
        res.json({ msg: 'borra usuarios' });
    });

router.get('/', (req, res) => {
    res.json({ msg: 'consulta usuarios' });
});

module.exports = router;
