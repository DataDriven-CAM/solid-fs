Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false
})
describe('Solid FS Test', function() {
  it('Visit Repository Client', function() {
    cy.visit('http://localhost:8888/repository_client.html')
    cy.get('#get').click({ force: true });
    cy.get('#resource').type('scad/primary-disk2.scad');
  })
})
