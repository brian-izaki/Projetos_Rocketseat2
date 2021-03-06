const axios = require('axios');
const Dev = require('../models/Dev')
const parseStringAsArray = require('../utils/parseStringAsArray')
const { findConnections, sendMessage } = require('../websocket')
// controller geralmente tem 5 funções: index, store, update, destroy

module.exports = {
  async index(request, response){
    const dev = await Dev.find();

    return response.json(dev);
  },

  async store(request, response){
    const { github_username, techs, latitude, longitude } = request.body;
    
    let dev = await Dev.findOne({ github_username });

    if (!dev){
      const apiResponse = await axios.get(`https://api.github.com/users/${github_username}`);
  
      const { name = login, avatar_url, bio } = apiResponse.data;
    
      const techsArray = parseStringAsArray(techs);
    
      const location = {
        type:'Point',
        coordinates: [longitude, latitude],
      }
    
      dev = await Dev.create({
        github_username, //= "github_username = github_username" short Syntax: nome de propriedade e variável são iguais. 
        name,
        avatar_url,
        bio,
        techs: techsArray,
        location,
      })

      //filtrar as conexoes estão há no maximo 10km de distancia
      // dev pelo menos tem uma das tecnologias filtradas
      const sendSocketMessageTo = findConnections(
        {latitude, longitude },
        techsArray,
      );
      
      sendMessage(sendSocketMessageTo, 'new-dev', dev);

    };
  
    return response.json(dev);
  },

  async update(request, response){
    //alteração pelo id;
    console.log(request.body);
    const dev = request.body;



    return response.json(dev); //resposta do requerimento

  },

  async destroy(request, response){

  }
};