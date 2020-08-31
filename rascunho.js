// 1* encontre digimons com sp menor ou igual a 50 e atk maior que 310
db.digimons.aggregate([
    {
      $match: {
        $expr: {
          $or: [{ $lte: ["$sp", 50] }, { $gt: ["$atk", 310] }],
        },
      },
    },
]);

// 1. Blue Monday: encontre todos os digimons do attribute Water.
db.digimons.aggregate([
    {
        $match: {
            "attribute": "Water"
        }
    }
]);

// 2. Misirlou: altere a query de forma que os documentos também tenham o campo memory maior ou igual a 80

db.digimons.aggregate([
    {
      $match: {
        "spd": { $gte: 80 },
        "attribute": "Water"
      },
    },
]);

// 3. Pipeline: adicione a query anterior um novo estágio, de maneira que só os campor stage, name, memory e attribute seja retornados.

db.digimons.aggregate([
    {
      $match: {
        "memory": { $lte: 3 },
        "attribute": "Water"
      },
    },
    {
        $project: {
            "_id": 0,
            "stage": 1,
            "name": 1,
            "memory": 1,
            "attribute": 1
        }
    }
]);

// 4. Earth, Wind and Fire: selecione documentos com attribute Earth, Fire ou Wind digimons, projete apenas name e attribute.

db.digimons.aggregate([
    {
      $match: {
        "attribute": {
          $in: ["Earth", "Fire", "Wind"],
        },
      },
    },
    {
      $project: {
        "name": 1,
        "_id": 0,
        "attribute": 1,
      },
    },
]);

// 5. Nitro: retorne apenas o digimon com o maior valor no campo "spd".

db.digimons.aggregate([
    {
      $sort: {
        "spd": -1,
      },
    },
    { $limit: 1 },
  ]);

// 6. O Mago é Implacável: ache qual digimon tem o maior valor do campo "int", renomeie o campo "int" por poderMagico, "sp" por mana e adicione o campo "mago" com valor Patolino.

db.digimons.aggregate([
  {
    $sort: {
      int: -1,
    },
  },
  { $limit: 1 },
  {
    $project: {
      "mago": "Patolino",
      "poderMagico": "$int",
      "mana": "$sp",
    },
  },
]);


// 7. Changes: Encontre a média dos campos hp, sp, atk, def, int, spd; arrendonde os calores para números inteiros e nomeie os campos de sáida como mediaHp, mediaSp, mediaAtk, mediaDef, mediaInt e mediaSpd.

db.digimons.aggregate([
    {
      $group: {
        _id: "$stage",
        hp: { $avg: "$hp" },
        sp: { $avg: "$sp" },
        atk: { $avg: "$atk" },
        def: { $avg: "$def" },
        int: { $avg: "$int" },
        spd: { $avg: "$spd" },
      },
    },
    {
      $project: {
        mediaHp: { $round: "$hp" },
        mediaSp: { $round: "$sp" },
        mediaAtk: { $round: "$atk" },
        mediaDef: { $round: "$def" },
        mediaInt: { $round: "$int" },
        mediaSpd: { $round: "$spd" },
      },
    },
]);

// 8. Push it to the limit: selecione 7 digimons com maiores valores de "memory" e coloque seus nomes num array no campo names

db.digimons
  .aggregate([
    {
      $sort: { memory: -1 },
    },
    { $limit: 7 },
    {
      $group: {
        _id: "push it to the limit",
        names: { $push: "$name" },
      },
    },
]);

// 7
db.digimons.aggregate([
    {
      $match: {
        stage: "Baby", // seleciona apenas digimons do stage Baby
        $expr: {
          // operador usado para envelopar operador $or, pois ele não pode ser operador de alto nível dentro do estágio
          $or: [
            { $gt: ["$spd", 90] },
            { $lt: ["$sp", 60] }, // OU com o campo sp menor que 100
          ],
        },
      },
    },
]);
