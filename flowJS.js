function flowJS(){
    var obj = arguments[0], flow = {init: function(){}}, flowData = {}, noop = function(){}, init = 'init', trace = flowJS.trace = flowJS.trace||[init];
    if(({}).toString.call(obj) === '[object Object]'){
        extend(flow, obj);
        flow.init.call(extend({getCurr:function(){
            return init;
        }, stepData:function(dataName){
            return dataName?undefined:{};
        }, getPrev:noop, fail:noop, success:noop}, new Step(init)));
    }
    function Step(name){
        var nextStepName, nextData = {}, success = noop, fail = noop, nextStep, stepMapping = {};
        if(({}).toString.call(name) === '[object Array]'){
            for(var i=0;i<name.length;i++){
                stepMapping[name[i]] = false;
            }
        }else if(typeof name == 'string'){
            stepMapping[name] = false;
        }
        this.setNext = function(stepName, s, f){
            success = s||success;
            fail = f||fail;
            nextStepName = stepName||nextStepName;
            nextStep = new Step(nextStepName);
            return nextStep;
        };
        this.nextData = function(data){
            extend(nextData, data);
        };
        this.flowData = function(data){
            ({}).toString.call(data)==='[object Object]' && extend(flowData, data);
            return (typeof data=='string')?flowData[data]:flowData;
        };
        this.getNext = function(){
            return nextStepName;
        };
        this.next = function(stepName, s, f){
            nextStepName = stepName||nextStepName;
            success = s||success;
            fail = f||fail;
            nextStep = stepName?new Step(stepName):nextStep;
            if(nextStepName){
                nextStep.stepData = function(dataName){
                    return dataName?nextData[dataName]:nextData;
                };
                nextStep.getPrev = function(){
                    return name;
                };
                nextStep.fail = function(){
                    fail.apply(this, arguments);
                };
                nextStep.success = function(){
                    success.apply(this, arguments);
                };
                stepMapping[this.getCurr()] = true;
                if(allDone()){
                    trace.push(nextStepName);
                    typeof nextStepName == 'string' && proxy(nextStepName);
                    if(({}).toString.call(nextStepName) === '[object Array]'){
                        for(var i=0; i<nextStepName.length; i++){
                            proxy(nextStepName[i]);
                        }
                    }
                    function proxy(stepName, fn){
                        if(typeof (fn = flow[stepName]) == 'function'){
                            (function(fn, context){
                                return function(){
                                    return fn.apply(context, arguments);
                                };
                            })(fn, extend({getCurr:function(){
                                return stepName;
                            }}, nextStep))();
                        }else{
                            throw new Error("step not found: "+stepName);
                        }
                    }
                }
                return nextStep;
            }
        };
        function allDone(hasStep) {
            prop(stepMapping, function(p){
                hasStep = hasStep || !stepMapping[p];
            });
            return !hasStep;
        }
    }
    function prop(obj, fun){
        for(var p in obj) {
            obj.hasOwnProperty(p) && fun(p);
        }
    }
    function extend(des, src){
        prop(src, function(p){
            des[p] = src[p];
        });
        return des;
    }
}