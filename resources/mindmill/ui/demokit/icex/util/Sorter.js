/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.demokit.icex.util.Sorter");sap.ui.demokit.icex.util.Sorter={sortByName:function(a,b){if(!a||!a.name){return-1;}else if(!b||!b.name){return 1;}else{var n=a.name.toLowerCase();var N=b.name.toLowerCase();if(n<N){return-1;}else{return(n>N)?1:0;}}}};
