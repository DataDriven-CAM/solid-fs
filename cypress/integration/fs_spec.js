
describe('Solid FS Test', function() {
  it('Visit Repository Client', function() {
    cy.visit('http://roger-G74Sx:8888/repository_client.html')
    cy.get('#get').click();
  })
})
