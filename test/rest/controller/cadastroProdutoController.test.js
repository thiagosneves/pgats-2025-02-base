const request = require('supertest');
const sinon = require('sinon');
const { expect } = require('chai');

const app = require('../../../rest/app'); // Ajuste o caminho conforme necessário
const checkoutService = require('../../../src/services/checkoutService');

describe('CadastroProdutoController', () => {
    describe('POST /checkout', () => {

        beforeEach(async () => {
            const respostaLogin = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'thiago@email.com',
                    password: '123456'
                });

            token = respostaLogin.body.token;
        });

        it('Usando Mock: deve processar o checkout corretamente e retornar o status 200', async () => {
            const checkoutStub = sinon.stub(checkoutService, 'calculateTotal');
            checkoutStub.returns({ total: 210, items: [{ productId: 1, quantity: 2, price: 100 }], freight: 10 });

            const resposta = await request(app)
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    items: [{ productId: 1, quantity: 2 }],
                    freight: 10,
                    name: 'Produto A',
                    paymentMethod: 'credit_card',
                    cardData: { number: '1111', expiry: '10/25', cvv: '983' }
                });
            expect(resposta.status).to.equal(200);
            checkoutStub.restore();
            });
        
        it('Usando Mock: Deve retornar erro 400 ao tentar processar checkout com produto inexistente', async () => {
            const checkoutStub = sinon.stub(checkoutService, 'calculateTotal');
            checkoutStub.throws(new Error('Produto não encontrado'));
            const resposta = await request(app)
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}`)    
                .send({
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