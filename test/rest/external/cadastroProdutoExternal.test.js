const request = require('supertest');
const { expect } = require('chai');
require('dotenv').config();

describe('CadastroProdutoExternal', () => {
    describe('POST /produtos', () => {
        beforeEach(async () => {
            const respostaLogin = await request(process.env.BASE_URL_REST)
                .post('/api/users/login')
                .send({
                    email: 'thiago@email.com',
                    password: '123456'
                });
            token = respostaLogin.body.token;
        });
        it('Deve processar a lista de produtos e retornar status 200', async () => {
            const resposta = await request(process.env.BASE_URL_REST)
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}`)
                .send ({
                    userId : 1,
                    items: [{ productId: 1, quantity: 2 }],
                    freight: 10,
                    name: 'Produto A',
                    paymentMethod: 'credit_card',
                    cardData: { number: '1111', expiry: '10/25', cvv: '983' }
                });
                //const respostaEsperada = require('../fixture/respostas/quandoInformoProdutoValidoRetornaSucessoCom201.json');
                expect(resposta.status).to.equal(200);
            });
        it('Deve retornar erro 400 ao tentar processar checkout com produto inexistente', async () => {
            const resposta = await request(process.env.BASE_URL_REST)
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}`)    
                .send({
                    userId : 1,
                    items: [{ productId: 999, quantity: 2 }],
                    freight: 10,
                    name: 'Produto Inexistente',
                    paymentMethod: 'credit_card',
                    cardData: { number: '4111111111111111', expiry: '12/24', cvv: '123' }
                });
            expect(resposta.status).to.equal(400);
            expect(resposta.body).to.have.property('error', 'Produto não encontrado');
        });
    });
});