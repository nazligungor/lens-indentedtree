/*
* ./src/RealtimeChangeHandler.js
*
* Handle each type of change by updating the data accordingly 
*/

const util = require('./Utils.js');
let realtime;

function preprocess(node){
  return util.childrenize(util.prepareHierarchyData(node));
}

function addSample(data,subjectAbsolutePath, sample) {
  if(data.absolutePath === subjectAbsolutePath){
    if(data.samples){
      data.samples[sample.name] = sample;
      data.samples[sample.name].sampleValue = sample.sampleValue;
    }else {
      let newArr = {};
      newArr[sample.name] = sample;
      newArr[sample.name].samples = sample.sampleValue;
      data.samples = newArr;
    }
  }

  if(data.children){
    data.children.forEach((n) => {
      addSample(n, subjectAbsolutePath, sample);
    });
  }
}

function removeSample(data,subjectAbsolutePath, sample){
  if(data.absolutePath === subjectAbsolutePath) {
    if(data.samples){
      delete data.samples[sample.name];
    }
  }

  if (data.children){
    data.children.forEach((n) => {
      removeSample(n, subjectAbsolutePath,sample);
    });
  }
}

function updateSample(data, subjectAbsolutePath, sample){
  if(data.absolutePath === subjectAbsolutePath){
    if(data.samples && data.samples[sample.name]){
      data.samples[sample.name] = sample;
      data.samples[sample.name].sampleValue = sample.sampleValue;
    }else{
      addSample(data, subjectAbsolutePath, sample);
    }
  }
  if(data.children){
    data.children.forEach((n) => {
      updateSample(n, subjectAbsolutePath, sample);
    });
  }
}

function onSampleAdd(sample, data) {
	console.log(new Date(), 'onSampleAdd', sample);
  let subjectAbsolutePath = sample.name.split('|')[0];
  console.log('subject of sample ' + subjectAbsolutePath)
  addSample(data,subjectAbsolutePath,sample);
 }

function onSampleRemove(sample, data) {
	console.log(new Date(), 'onSampleRemove', sample);
  let subjectAbsolutePath = sample.name.split('|')[0];
  removeSample(data, subjectAbsolutePath, sample);
}

function onSampleUpdate(change, data) {
	console.log(new Date(), 'onSampleUpdate', change);
	// TODO implement me!
	// For example, you may need to preprocess and update this sample in some
	// data structure.
  let subjectAbsolutePath = sample.name.split('|')[0];
  updateSample(data, subjectAbsolutePath, change);
}

function onSubjectAdd(subject, data) {
	console.log(new Date(), 'onSubjectAdd', subject);
	// TODO implement me!
	// For example, you may need to preprocess and add this new subject to some
	// data structure.
}

function onSubjectRemove(subject, data) {
	console.log(new Date(), 'onSubjectRemove', subject);
	// TODO implement me!
	// For example, you may need to preprocess and remove this subject from
	// some data structure.
}

function onSubjectUpdate(change, data) {
	console.log(new Date(), 'onSubjectUpdate', change);
	// TODO implement me!
	// For example, you may need to preprocess and update this subject in some
	// data structure.
}

module.exports = {
	handle: function (chg, data) {
		if (chg['sample.add']) {
          onSampleAdd(chg['sample.add'], data)
        } else if (chg['sample.remove']) {
          onSampleRemove(chg['sample.remove'], data)
        } else if (chg['sample.update']) {
          onSampleUpdate(chg['sample.update'], data);
        } else if (chg['subject.add']) {
          onSubjectAdd(chg['subject.add'], data)
        } else if (chg['subject.remove']) {
          onSubjectRemove(chg['subject.remove'], data)
        } else if (chg['subject.update']) {
          onSubjectUpdate(chg['subject.update'], data)
        }
	},
};
