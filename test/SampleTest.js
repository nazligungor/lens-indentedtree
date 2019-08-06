const expect = require('chai').expect;
const fs = require('fs-extra');
const RealtimeChangeHandler = require('../src/RealtimeChangeHandler.js');
const util = require('../src/Utils.js');
let sampleData = JSON.parse(fs.readFileSync('./test/weatherByCountry.json'));

const newSample = {
  "name": "rfx.Central_America.Belize|rfx-Fog",
  "status": "OK",
  "value": "15",
  "aspect": {
    "name": "rfx-Fog",
  }
};
function preprocess(node){
  return util.childrenize(util.prepareHierarchyData(node));
}
describe('SampleTest for RealTimChangeHandler.js  > ', () => {

  it('onSampleAdd should be called for a sample update', () => {
    const chg = {'sample.add' : newSample };
    const root = preprocess(sampleData);
    console.log(Object.keys(root.samples));
    RealtimeChangeHandler.handle(chg, root);
    console.log(root.samples);
    expect(root.samples[newSample.name]).to.be.true;

      //.to.have.members(["sampleData.L2.a2|sample2.2","sampleData.L2.a2|sample2.1",
      //"sampleData.L1.a1|sample1.2","sampleData.L1.a1|sample1.1", "NewSample|NewAddition"]);
  });
});
