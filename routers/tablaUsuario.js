const express = require('express');
const router = express.Router();

router.route('/:id')
    .get((req, res) => {
        res.json({ msg: 'consulta tabla de un usuario' });
    })
    .post((req, res) => {
        res.json({ msg: 'ingreso nueva linea en tabla de un usuario' });
    })
    .put((req, res) => {
        res.json({ msg: 'modifica tabla de todo el usuario' });
    })
    .patch((req, res) => {
        res.json({ msg: 'modifica parte de la tabla de un usuario' });
    })
    .delete((req, res) => {
        res.json({ msg: 'borra tabla de unn usuario' });
    });

router.get('/', (req, res) => {
    res.json({ msg: 'consulta tablas de usuarios' });
});

module.exports = router;
