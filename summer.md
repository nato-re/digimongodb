# Aggregations 

## O que vamos aprender?
- O que é o aggregation framework?
- O que é um estágio de uma pipeline?


## Você será capaz de:
- Montar uma pipeline usando os operadores $match, $project e $group ($lookup), em conjunto 
- Relacionar dados de duas collections e retornar a relação em um documento só 


## Porque isso é importante?

 // Imagine que você quer realicionar duas collections
Usando o Aggregations você tem ferramentas para criar buscas mais complexas no banco. Além disso, você consegue manipular o resultado final. Usando os operadores, é possível filtrar documentos por comparação, projetar campos e relacionar duas coleções de dados.


## Conteúdos

Cada estágio, opera sobre o documento recebido e passa o resultado para o próximo. Existem muitos operadores de agregação e a mágica está em combina-los, mas vamos conhecer um de cada vez.
Quando chegar a hora de combinar você sempre pode consultar os exemplos e a documentação(link).

Vamos começar pelo $match e pelo $project. Por mais novo que parece, você já teve o contato com as mecânicas deles.

Assim como o primeiro parametro do .find({~~esse~~}), o $match seleciona apensa os documentos que entram nas restrições que você já construiu nos últimos dias. 

**$match:** filtra o numero de documentos por uma restrição e passa o retorno para o próximo estágio. // dropdown

Imagine que você precise achar no banco documentos só com o campor value maior que 8000

```jsx
db.example.aggregate([
	{
		$match:{
			"value":{$gt: 8000}
		}
	}
])
```


Já o $project é como o segundo parâmetro do .find({}, {~~esse~~})

**$project:** passa documentos com campos específicos ou computa novos campos para o próximo estágio 

```jsx
db.example.aggregate([
	{
		$project:{
			"value": 1,
			"_id": "$cpf",
			"novo_id": "$_id"
		}
	}
])
```

**$group:** agrupa por uma chave distinta, ou por uma chave composta

```jsx
db.example.aggregate([
	{
		$group:{
			"_id": null,
			$avg: 1
	}
])
```

## Exercícios




## Recursos Adicionais
    $lookup