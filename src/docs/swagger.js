import swaggerAutogen from 'swagger-autogen'

const outputFile = './swagger.json'
const endpointsFiles = [
    '../routes/user.route',
    '../routes/auth.route',
]

swaggerAutogen(outputFile, endpointsFiles)