// encontre os pokemons com o campo memory menor ou igual a 2

db.digimons.aggregate([
    {
        $match: { 
            "memory": { $lte: 2 }
        },
    },
])
.pretty();


// o mago é implacável, ache o digimon com maior valor do campo int

db.digimons.aggregate([
    {
        $sort: { 
            "int": -1
        },
    },
    { $limit: 1 }
]);

// agrupe os digimons por tipo e crie um array como os nomes deles

db.digimons.aggregate([
    {
        $group: {
        _id: "$type",
        names: { $push: "$name" },
        },
    },
])
.pretty();

// push it to the limit, selecione os 7 digimons com maior "memory" e coloque seus nomes num array no campo names

db.digimons.aggregate([
    {
        $sort: { "memory": -1 },
    },
    { $limit: 7 },
    {
        $group: {
        "_id": "push it to the limit",
        "names": { $push: "$name" },
        },
    },
])
.pretty();

// ache a média dos campos hp, sp, atk, def, int, spd; arrendonde os calores para números inteiros e nomeie os campos de sáida como mediaHp, mediaSp, mediaAtk, mediaDef, mediaInt e mediaSpd

db.digimons.aggregate([
    { 
        $group: {
            "_id": null,
            "hp": { $avg: "$hp"},
            "sp": { $avg: "$sp"},
            "atk": { $avg: "$atk"},
            "def": { $avg : "$def"},
            "int": { $avg: "$int" },
            "spd": { $avg: "$spd" }
        }
    },
    {
        $project: {
            "mediaHp": { $round: "$hp"},
            "mediaSp": { $round: "$sp"},
            "mediaAtk": { $round: "$atk"},
            "mediaDef": { $round : "$def"},
            "mediaInt": { $round: "$int" },
            "mediaSpd": { $round: "$spd" }
        }
    }
]).pretty();
    



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
])
.pretty();