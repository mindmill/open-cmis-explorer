/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','sap/ui/base/EventProvider','sap/ui/model/message/MessageModel','./Message','./ControlMessageProcessor'],function(q,E,M,c,C){"use strict";var d=E.extend("sap.ui.core.message.MessageManager",{constructor:function(){E.apply(this,arguments);this.mProcessors={};this.mObjects={};this.mMessages={};var h=sap.ui.getCore().getConfiguration().getHandleValidation();if(h){sap.ui.getCore().attachValidationSuccess(h,this._handleSuccess,this);sap.ui.getCore().attachValidationError(h,this._handleError,this);sap.ui.getCore().attachParseError(h,this._handleError,this);sap.ui.getCore().attachFormatError(h,this._handleError,this);}},metadata:{publicMethods:["addMessages","removeMessages","removeAllMessages","registerMessageProcessor","unregisterMessageProcessor","registerObject","unregisterObject","getMessageModel","destroy"]}});d.prototype._handleError=function(e,h){if(!this.oControlMessageProcessor){this.oControlMessageProcessor=new C();}if(h){var o=e.getParameter("element");var p=e.getParameter("property");var t=o.getId()+'/'+p;var P=this.oControlMessageProcessor.getId();var T=e.sId==="formatError";if(this.mMessages[P]&&this.mMessages[P][t]){this.removeMessages(this.mMessages[P][t]);}var m=new sap.ui.core.message.Message({type:sap.ui.core.MessageType.Error,message:e.getParameter("message"),target:t,processor:this.oControlMessageProcessor,technical:T});this.addMessages(m);}e.cancelBubble();};d.prototype._handleSuccess=function(e,h){if(!this.oControlMessageProcessor){this.oControlMessageProcessor=new C();}if(h){var o=e.getParameter("element");var p=e.getParameter("property");var t=o.getId()+'/'+p;var P=this.oControlMessageProcessor.getId();if(this.mMessages[P]&&this.mMessages[P][t]){this.removeMessages(this.mMessages[P][t]);}}e.cancelBubble();};d.prototype.addMessages=function(m){var o=m;if(!m){return;}else if(q.isArray(m)){for(var i=0;i<m.length;i++){o=m[i];this._importMessage(o);}}else{this._importMessage(m);}this._updateMessageModel();};d.prototype._importMessage=function(m){var s=m.getTarget();var p=m.getMessageProcessor().getId();if(!this.mMessages[p]){this.mMessages[p]={};}var a=this.mMessages[p][s]?this.mMessages[p][s]:[];a.push(m);this.mMessages[p][s]=a;};d.prototype._pushMessages=function(){var t=this;q.each(this.mProcessors,function(i,p){var m=t.mMessages[i]?t.mMessages[i]:{};t._sortMessages(m);p.setMessages(m);});};d.prototype._sortMessages=function(m){var s={'Error':0,'Warning':1,'Success':2,'Info':3};q.each(m,function(t,e){e.sort(function(a,b){return s[b.severity]-s[a.severity];});});};d.prototype._updateMessageModel=function(){var m=[];if(!this.oMessageModel){this.oMessageModel=new M(this);}q.each(this.mMessages,function(p,a){q.each(a,function(k,v){m=q.merge(m,v);});});this.oMessageModel.setData(m);this._pushMessages();};d.prototype.removeAllMessages=function(){this.aMessages=[];this.mMessages={};this._updateMessageModel();};d.prototype.removeMessages=function(m){var t=this;if(!m||(q.isArray(m)&&m.length==0)){return;}else if(q.isArray(m)){for(var i=0;i<m.length;i++){t._removeMessage(m[i]);}}else if(m instanceof sap.ui.core.message.Message){t._removeMessage(m);}else{q.each(m,function(T,a){t.removeMessages(a);});}this._updateMessageModel();};d.prototype._removeMessage=function(m){var a=this.mMessages[m.getMessageProcessor().getId()];if(!a){return;}var b=a[m.getTarget()];if(b){for(var i=0;i<b.length;i++){var o=b[i];if(q.sap.equal(o,m)&&!o.getPersistent()){b.splice(i,1);}}}};d.prototype.onMessageChange=function(e){var o=e.getParameter('oldMessages');var n=e.getParameter('newMessages');this.removeMessages(o);this.addMessages(n);};d.prototype.registerMessageProcessor=function(p){if(!this.mProcessors[p.getId()]){this.mProcessors[p.getId()]=p;p.attachMessageChange(this.onMessageChange,this);}};d.prototype.unregisterMessageProcessor=function(p){this.removeMessages(this.mMessages[p.getId()]);delete this.mProcessors[p.getId()];p.detachMessageChange(this.onMessageChange);};d.prototype.registerObject=function(o,h){if(!o instanceof sap.ui.base.ManagedObject){q.sap.log.error(this+" : "+o.toString()+" is not an instance of sap.ui.base.ManagedObject");return;}o.attachValidationSuccess(h,this._handleSuccess,this);o.attachValidationError(h,this._handleError,this);o.attachParseError(h,this._handleError,this);o.attachFormatError(h,this._handleError,this);};d.prototype.unregisterObject=function(o){if(!o instanceof sap.ui.base.ManagedObject){q.sap.log.error(this+" : "+o.toString()+" is not an instance of sap.ui.base.ManagedObject");return;}o.detachValidationSuccess(this._handleSuccess);o.detachValidationError(this._handleError);o.detachParseError(this._handleError);o.detachFormatError(this._handleError);};d.prototype.destroy=function(){var t=this;q.each(this.mProcessors,function(i,p){p.detachMessageChange(this.onMessageChange);});q.each(this.mObjects,function(i,o){o.detachValidationSuccess(t._handleSuccess);o.detachValidationError(t._handleError);o.detachParseError(t._handleError);o.detachFormatError(t._handleError);});if(sap.ui.getCore().getConfiguration().getHandleValidation()){sap.ui.getCore().detachValidationSuccess(this._handleSuccess);sap.ui.getCore().detachValidationError(this._handleError);sap.ui.getCore().detachParseError(this._handleError);sap.ui.getCore().detachFormatError(this._handleError);}this.mProcessors=undefined;this.mMessages=undefined;this.mObjects=undefined;this.oMessageModel.destroy();};d.prototype.getMessageModel=function(){if(!this.oMessageModel){this.oMessageModel=new M(this);}return this.oMessageModel;};return d;},true);
