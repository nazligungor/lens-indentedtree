const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const childProcess = require('child_process');

describe('SampleTest for main.js > ', () => {

  it('add event listeners', (done) => {
    //let addListener = sinon.spy(document, 'addEventListener');
    //expect(addListener.calledOnce).not.to.be.true
    const forkedProcess = childProcess.exec('npm run prototype', {timeout: 5000});
    forkedProcess.on('refocus.lens.load', () =>{
      const evt = ['refocus.lens.hierarchyLoad', 'window.resize', 'refocus.lens.realtime.change', 'refocus'];
      sinon.spy(evt);
      console.log('here')
      evt.forEach( (e) => {
        console.log('hit this line');
        expect(e.calledOnce).to.be.true;
      });
    });
    done();
    forkedProcess.kill();
  });
});
