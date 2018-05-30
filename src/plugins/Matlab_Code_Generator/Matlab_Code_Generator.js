/*globals define*/
/*jshint node:true, browser:true*/

/**
 * Generated by PluginGenerator 1.7.0 from webgme on Tue Sep 06 2016 09:38:10 GMT-0500 (CDT).
 * A plugin that inherits from the PluginBase. To see source code documentation about available
 * properties and methods visit %host%/docs/source/PluginBase.html.
 */

define([
    'plugin/PluginConfig',
    'text!./metadata.json',
    'plugin/PluginBase'
], function (
    PluginConfig,
    pluginMetadata,
    PluginBase) {
    'use strict';

    pluginMetadata = JSON.parse(pluginMetadata);

    /**
     * Initializes a new instance of Matlab_Code_Generator.
     * @class
     * @augments {PluginBase}
     * @classdesc This class represents the plugin Matlab_Code_Generator.
     * @constructor
     */
    var Matlab_Code_Generator = function () {
        // Call base class' constructor.
        PluginBase.call(this);
        this.pluginMetadata = pluginMetadata;
    };

    /**
     * Metadata associated with the plugin. Contains id, name, version, description, icon, configStructue etc.
     * This is also available at the instance at this.pluginMetadata.
     * @type {object}
     */
    Matlab_Code_Generator.metadata = pluginMetadata;

    // Prototypical inheritance from PluginBase.
    Matlab_Code_Generator.prototype = Object.create(PluginBase.prototype);
    Matlab_Code_Generator.prototype.constructor = Matlab_Code_Generator;

    /**
     * Main function for the plugin to execute. This will perform the execution.
     * Notes:
     * - Always log with the provided logger.[error,warning,info,debug].
     * - Do NOT put any user interaction logic UI, etc. inside this method.
     * - callback always has to be called even if error happened.
     *
     * @param {function(string, plugin.PluginResult)} callback - the result callback
     */
    Matlab_Code_Generator.prototype.main = function (callback) {
        // Use self to access core, project, result, logger etc from PluginBase.
        // These are all instantiated at this point.
        var self = this,
            nodeObject;


        // Using the logger.
        //self.logger.debug('This is a debug message.');
        //self.logger.info('This is an info message.');
        //self.logger.warn('This is a warning message.');
        //self.logger.error('This is an error message.');

        /** Using the coreAPI to build desired method functions.
        * If not a power system then return
        */

        nodeObject = self.activeNode;
        if (self.core.getPath(self.activeNode) === ' ' || self.isMetaTypeOf(self.activeNode, self.META.PowerSystem) === false)
        {
            callback('ActiveNode is not a powersystem', self.result);
            return;
        }
	    
	/** If it's a power system then start loading
        */
        self.core.loadSubTree(self.activeNode, function (err, nodeList) {
            if (err) {
                callback(err);
                return;
            }
        var i,
            nodePath,
            nodes = {};
        for (i = 0; i < nodeList.length; i += 1) {
            nodePath = self.core.getPath(nodeList[i]);
            nodes[nodePath] = nodeList[i];
            //self.logger.info(nodePath);
        }
		
	/** Method variables initialization
        */
        var powersystem = {
            sources: [], lines: [], loads: [], transformers: [], faults: [], buses: []
        };
        
        var childrenPaths = self.core.getChildrenPaths(self.activeNode);
            var j,
            	violationStr,
                connectionPaths, connectionNode,srcpath, srcNode, dstPath, dstNode;
                
            violationStr = self.checkViolations(nodes, childrenPaths);
            if (violationStr) {
            	callback(violationStr, self.result);
            	return; 
            }   
            
	    /** Loop through all childrens
            */
            for (i=0; i < childrenPaths.length; i += 1) {
                var childNode = nodes[childrenPaths[i]];
		/** Check if the Node Meta type is a Source
                */
                if (self.isMetaTypeOf(childNode, self.META.Source) === true) {
                    var nam = self.core.getAttribute(childNode, 'name');
                    var connbus;
                    connectionPaths = self.core.getCollectionPaths(childNode, 'src'); // Obtain the connections between a node with all the other connecting nodes
                    var source_position = self.core.getRegistry(childNode, 'position'); //Obtain the position of the object in the WebGme Model
                    for (j = 0; j < connectionPaths.length; j += 1) {
                        //self.logger.info(self.core.getAttribute(childNode, 'name'));
                        connectionNode = nodes[connectionPaths[j]];
                        srcpath = self.core.getPointerPath(connectionNode, 'src'); // Obtain source path 
                        srcNode = nodes[srcpath];
                        dstPath = self.core.getPointerPath(connectionNode, 'dst'); //Obtain destination path
                        dstNode = nodes[dstPath];
                        //self.logger.info(self.core.getAttribute(dstNode, 'name'));
                        var dstname = self.core.getAttribute(dstNode, 'name'); // Obtain destination node name
                        var relid = self.core.getRelid(dstNode); // Obtain destination node ID
                        connbus = dstname;
                        //buses.push('bus' + 1 + '=' + dstname);
                    }
			
		    /** Gathering the information using coreAPI and storing it in the dictionary
                    */
                    var sourcenam = self.core.getAttribute(childNode, 'name');
                    var MVA = self.core.getAttribute(childNode, 'MVA');
                    var r1 = self.core.getAttribute(childNode, 'R1');
                    var x1 = self.core.getAttribute(childNode, 'X1');
                    var phase = self.core.getAttribute(childNode, 'phases');
                    var basekv = self.core.getAttribute(childNode, 'basekv');
                    var freq = self.core.getAttribute(childNode, 'frequency');
                    var pos = source_position;
                    powersystem.sources.push({
                        name: sourcenam,
                        MVA: MVA,
                        R1: r1,
                        X1: x1,
                        phases: phase,
                        basekv: basekv,
                        conbus: connbus,
                        freq: freq,
                        pos: pos
                    });
                    //self.logger.info(source_position);
                }
		    
		/** Check if the Node Meta type is a Transmission Line
                */
                if (self.isMetaTypeOf(childNode, self.META.TransmissionLine) === true) {
                    var Lname = self.core.getAttribute(childNode, 'name');
                    var TL_position = self.core.getRegistry(childNode, 'position');
                    //self.logger.info(Lname);
	  	    
		    /** Obtain the source and destination and their corresponding paths 
                    */
                    connectionPaths = self.core.getCollectionPaths(childNode, 'src');
                    for (j = 0; j < connectionPaths.length; j += 1) {
                        //self.logger.info(self.core.getAttribute(childNode, 'name'));
                        connectionNode = nodes[connectionPaths[j]];
                        srcpath = self.core.getPointerPath(connectionNode, 'src');
                        srcNode = nodes[srcpath];
                        dstPath = self.core.getPointerPath(connectionNode, 'dst');
                        dstNode = nodes[dstPath];
                        var dname = self.core.getAttribute(dstNode, 'name');
                        var destinationbus = dname;
                        //self.logger.info(dname);
                    }

                    connectionPaths = self.core.getCollectionPaths(childNode, 'dst');
                    for (j = 0; j < connectionPaths.length; j += 1) {
                        //    self.logger.info(self.core.getAttribute(childNode, 'name'));
                        connectionNode = nodes[connectionPaths[j]];
                        srcpath = self.core.getPointerPath(connectionNode, 'src');
                        srcNode = nodes[srcpath];
                        dstPath = self.core.getPointerPath(connectionNode, 'dst');
                        dstNode = nodes[dstPath];
                        //self.logger.info(self.core.getAttribute(dstNode, 'name'));
                        var srcname = self.core.getAttribute(srcNode, 'name');
                        var sourcebus = srcname;
                        //self.logger.info(srcname);
                    }
		
		    /** Gather the related information and store it in the dictionary
                    */
                    var Linename = self.core.getAttribute(childNode, 'name');
                    var C0 = self.core.getAttribute(childNode, 'C0');
                    var C1 = self.core.getAttribute(childNode, 'C1');
                    var X0 = self.core.getAttribute(childNode, 'X0');
                    var X1 = self.core.getAttribute(childNode, 'X1');
                    var R0 = self.core.getAttribute(childNode, 'R0');
                    var Length = self.core.getAttribute(childNode, 'Length');
                    var R1 = self.core.getAttribute(childNode, 'R1');
                    var Units = self.core.getAttribute(childNode, 'units');
                    var TL_pos = TL_position;
                    //self.logger.info(Linename);
                    //self.logger.info(C0);
                    //self.logger.info(C1);
                    //self.logger.info(X0);
                    //self.logger.info(X1);
                    //self.logger.info(R0);
                    //self.logger.info(R1);
                    //self.logger.info(Length);
                    //self.logger.info(Units);
                    powersystem.lines.push({
                        name: Linename,
                        C0: C0,
                        C1: C1,
                        R1: R1,
                        R0: R0,
                        X0: X0,
                        X1: X1,
                        Length: Length,
                        Units: Units,
                        srcbus: sourcebus,
                        dstbus: destinationbus,
                        pos: TL_pos
                    });
                }
		    
		 /** Check if the Node Meta type is a Transformer 
                 */
                 if (self.isMetaTypeOf(childNode, self.META.Transformer) === true){
                    var Tname = self.core.getAttribute(childNode, 'name');
                	//self.logger.info(Tname);
                	connectionPaths = self.core.getCollectionPaths(childNode, 'dst');
                	var transformer_position = self.core.getRegistry(childNode, 'position');
			 
		    /** Obtain the source and destination and their corresponding paths 
                    */
                    for (j = 0; j < connectionPaths.length; j += 1) {
                        connectionNode = nodes[connectionPaths[j]];
                        srcpath = self.core.getPointerPath(connectionNode, 'src');                            
                        srcNode = nodes[srcpath];
                        dstPath = self.core.getPointerPath(connectionNode, 'dst');
                    	dstNode = nodes[dstPath];
                        var Transformer_sourcename = self.core.getAttribute(srcNode, 'name');
                        //self.logger.info(Transformer_sourcename);
                    }
                   	connectionPaths = self.core.getCollectionPaths(childNode, 'src');
                    for (j = 0; j < connectionPaths.length; j += 1) {                            
                    	connectionNode = nodes[connectionPaths[j]];
                        srcpath = self.core.getPointerPath(connectionNode, 'src');
                        srcNode = nodes[srcpath];
                        dstPath = self.core.getPointerPath(connectionNode, 'dst');
                    	dstNode = nodes[dstPath];
                    	var Transformer_dstname = self.core.getAttribute(dstNode, 'name');
                    	//self.logger.info(Transformer_dstname);
                    }   
			 
		    /** Gather the related information and store it in the dictionary
                    */
                    var num_of_phases = self.core.getAttribute(childNode, 'phases');
                	var conns = self.core.getAttribute(childNode, 'conns');
                	var XHL = self.core.getAttribute(childNode, 'XHL');
                	var kvs = self.core.getAttribute(childNode, 'kvs');
                	var L1 = self.core.getAttribute(childNode, 'L1');
                	var L2 = self.core.getAttribute(childNode, 'L2');
                	var mva = self.core.getAttribute(childNode, 'MVA');
                	var R1 = self.core.getAttribute(childNode, 'R1');
                	var R2 = self.core.getAttribute(childNode, 'R2');
                	var xformer_pos = transformer_position;
                	powersystem.transformers.push({
                        name: Tname,                            
                        phases: num_of_phases,
                        source_bus: Transformer_sourcename,
                        Dest_name: Transformer_dstname,
                        XHL: XHL,
                        conns: conns,
                        kvs: kvs,
                        L1: L1,
                        L2: L2,
                        R1: R1,
                        R2: R2,
                        mva: mva,
                        pos: xformer_pos
                    });                    	
                    //self.logger.info(transformer_position);
                }
		    
		/** Check if the Node Meta type is a Load 
                */
                if (self.isMetaTypeOf(childNode, self.META.Load) === true) {
                    var Ldname = self.core.getAttribute(childNode, 'name');
                    var load_position = self.core.getRegistry(childNode, 'position');
                    //self.logger.info(Ldname);
                    connectionPaths = self.core.getCollectionPaths(childNode, 'dst');
		 
		    /** Obtain the source and destination and their corresponding paths 
                    */
                    for (j = 0; j < connectionPaths.length; j += 1) {
                        //self.logger.info(self.core.getAttribute(childNode, 'name'));
                        connectionNode = nodes[connectionPaths[j]];
                        srcpath = self.core.getPointerPath(connectionNode, 'src');
                        srcNode = nodes[srcpath];
                        dstPath = self.core.getPointerPath(connectionNode, 'dst');
                        dstNode = nodes[dstPath];
                        //self.logger.info(self.core.getAttribute(dstNode, 'name'));
                        var sname = self.core.getAttribute(srcNode, 'name');
                        var dbus = sname;
                        //self.logger.info(sname);
                    }
			
		    /** Gather the related information and store it in the dictionary
                    */
                    var Loadname = self.core.getAttribute(childNode, 'name');
                    var phases = self.core.getAttribute(childNode, 'phases');
                    var KW = self.core.getAttribute(childNode, 'Kw');
                    var KV = self.core.getAttribute(childNode, 'kv');
                    var kvar = self.core.getAttribute(childNode, 'kvar');
                    var load_pos = load_position;
                    //self.logger.info(Loadname);
                    //self.logger.info(phases);
                    //self.logger.info(KW);
                    //self.logger.info(KV);
                    powersystem.loads.push({
                        name: Loadname,
                        KW: KW,
                        KV: KV,
                        kvar: kvar,
                        phases: phases,
                        destbus: dbus,
                        pos: load_pos
                    });                  
                }
		    
		/** Check if the Node Meta type is a Fault 
                */
                if (self.isMetaTypeOf(childNode, self.META.Fault) === true) {
                    var Fname = self.core.getAttribute(childNode, 'name');
                    var fault_position = self.core.getRegistry(childNode, 'position');
                    connectionPaths = self.core.getCollectionPaths(childNode, 'dst');
			
		    /** Obtain the source and destination and their corresponding paths 
                    */
                    for (j = 0; j < connectionPaths.length; j += 1) {
                        connectionNode = nodes[connectionPaths[j]];                            
                        srcpath = self.core.getPointerPath(connectionNode, 'src');
                        srcNode = nodes[srcpath];
                        var faultsourcename = self.core.getAttribute(srcNode, 'name');
                    }
			
	            /** Gather the related information and store it in the dictionary
                    */
                    var Fname = self.core.getAttribute(childNode, 'name');
                    var numofphases = self.core.getAttribute(childNode, 'phases');
                    var R = self.core.getAttribute(childNode, 'R'); 
                    var fault_pos = fault_position;                        
                    powersystem.faults.push({
                        name: Fname,
                        phases: numofphases,
                        sourcebuss: faultsourcename,
                        R: R,
                        pos: fault_pos
                    }); 
                }
                if (self.isMetaTypeOf(childNode, self.META.Bus) === true) {
                    var Bname = self.core.getAttribute(childNode, 'name');
                    var bus_position = self.core.getRegistry(childNode, 'position'); 
                    var bus_pos = bus_position;                     
                    powersystem.buses.push({
                        name: Bname,
                        pos: bus_pos
                    }); 
                }
            }
         //self.logger.info (powersystem.buses);  
		
	 /** Using the stored information from the dictionary to create the system model 
         */
         var mConfig = 
         	'%Generated by Matlab_Code_Generator Plugin through WebGME\n';
         mConfig += '%Function to generate matlab model' + "\n" + '%Author: Saqib Hasan(saqib.hasan@vanderbilt.edu)' + "\n" + 
         			'function matlab_model_generator(f_name)\n' + 'fname = f_name;' + "\n" + '%Check if the file already exists and delete it if it does' + "\n";
         mConfig += "if exist (fname,'file') == 4" + "\n" + '    ' + 'if bdIsLoaded(fname)' + "\n" + '        ' + 
         			'close_system(fname,0)' + "\n" + '    ' + 'end' + "\n" + "    delete([fname, '.slx']);" + "\n" + 'end' + "\n";
         mConfig += 'new_system(fname);' + "\n" + 'save_system(fname);' + "\n" + 'open (fname);' + "\n" + 
         			'%ADD the powergui block' + "\n";
         mConfig += "add_block('powerlib/powergui',[fname," + "'/powergui'])\n";
         mConfig += "%ADD the buses and set their parameters\n";
         for (i =0; i < powersystem.buses.length; i += 1) {
         	 var block_len = powersystem.buses[i].pos.x + 6;
         	 var block_width = powersystem.buses[i].pos.y + 45;
         	 mConfig += "add_block('powerlib/Measurements/Three-Phase V-I Measurement',[fname," + "'/" + 
         	 			powersystem.buses[i].name + "'])\n";
         	 mConfig += "set_param([fname '/" + powersystem.buses[i].name + 
         	 			"'],'OutputType','Magnitude','VoltageMeasurement','No','Position',[" + powersystem.buses[i].pos.x + 
         	 			" " + powersystem.buses[i].pos.y + " " + block_len + " " + block_width + "],'BackgroundColor','Black')\n";
         } 
         mConfig += "%ADD the sources and set their parameters\n";
         for (i =0; i < powersystem.sources.length; i += 1) {
          	 var block_len = powersystem.sources[i].pos.x + 33;
         	 var block_width = powersystem.sources[i].pos.y + 31;
         	 mConfig += "add_block('powerlib/Electrical Sources/Three-Phase Source',[fname," + "'/" + 
         	 			powersystem.sources[i].name + "'])\n";
         	 mConfig += "add_line(fname,'" + powersystem.sources[i].name + "/Rconn1','" + 
         	 			powersystem.sources[i].conbus + "/Lconn1');\n";
         	 mConfig += "add_line(fname,'" + powersystem.sources[i].name + "/Rconn2','" + powersystem.sources[i].conbus + 
         	 			"/Lconn2');\n";
         	 mConfig += "add_line(fname,'" + powersystem.sources[i].name + "/Rconn3','" + powersystem.sources[i].conbus + 
         	 			"/Lconn3');\n";
         	 mConfig += "set_param([fname '/" + powersystem.sources[i].name + "'],'ShortCircuitLevel','" + 
         	 			powersystem.sources[i].MVA + "e6','BaseVoltage','" + powersystem.sources[i].basekv + "e3','Voltage','" +
         	 			powersystem.sources[i].basekv + "e3','Position',[" + powersystem.sources[i].pos.x + " " + 
         	 			powersystem.sources[i].pos.y + " " + block_len + " " + block_width + "],'BackgroundColor','Green')\n";
         }
         mConfig += "%ADD the transmission lines and set their parameters\n"; 
         for (i = 0; i < powersystem.lines.length; i += 1) {
         	 var k, measurement_block_pos_x, measurement_block_pos_y, measurement_block_len, measurement_block_width,
         	 		x_coor, y_coor;
         	 var block_len = powersystem.lines[i].pos.x + 53;
         	 var block_width = powersystem.lines[i].pos.y + 10;
         	 var l1 = powersystem.lines[i].X1/(2*3.14*60);
         	 var l0 = powersystem.lines[i].X0/(2*3.14*60);
         	 var measurement = 'Im' + (i + 1) ;
         	 var source_bus = powersystem.lines[i].srcbus;
         	 for (k = 0; k < powersystem.buses.length; k += 1){
         	 	 if (powersystem.buses[k].name === source_bus){
         	 	 	 x_coor = powersystem.buses[k].pos.x;
         	 	 	 y_coor = powersystem.buses[k].pos.y;
         	 	 	//self.logger.info('I am here');
         	 	 	//self.logger.info(x_coor);
         	 	 	//self.logger.info(y_coor);
         	 	 }
         	 }
         	 measurement_block_pos_x = (powersystem.lines[i].pos.x + x_coor)/2;
         	 measurement_block_pos_y = (powersystem.lines[i].pos.y + y_coor)/2;
         	 measurement_block_len = measurement_block_pos_x + 6;
         	 measurement_block_width = measurement_block_pos_y + 45;
         	 if (powersystem.lines[i].Units === 'mi'){
         	 		powersystem.lines[i].Length = 1.60934 * powersystem.lines[i].Length;
         	 }
         	 mConfig += "add_block('powerlib/Measurements/Three-Phase V-I Measurement',[fname," + "'/" + 
         	 			measurement + "'])\n";
         	 mConfig += "add_block('powerlib/Elements/Three-Phase PI Section Line',[fname," + "'/" + 
         	 			powersystem.lines[i].name + "'])\n";
         	 mConfig += "add_line(fname,'" + measurement + "/Lconn1','" + powersystem.lines[i].srcbus + 
         	 			"/Rconn1');\n";
         	 mConfig += "add_line(fname,'" + measurement + "/Lconn2','" + powersystem.lines[i].srcbus + 
         	 			"/Rconn2');\n";
         	 mConfig += "add_line(fname,'" + measurement + "/Lconn3','" + powersystem.lines[i].srcbus + 
         	 			"/Rconn3');\n";
         	 mConfig += "add_line(fname,'" + measurement + "/Rconn1','" + powersystem.lines[i].name + 
         	 			"/Lconn1');\n";
         	 mConfig += "add_line(fname,'" + measurement + "/Rconn2','" + powersystem.lines[i].name + 
         	 			"/Lconn2');\n";
         	 mConfig += "add_line(fname,'" + measurement + "/Rconn3','" + powersystem.lines[i].name + 
         	 			"/Lconn3');\n";
         	 mConfig += "add_line(fname,'" + powersystem.lines[i].name + "/Rconn1','" + powersystem.lines[i].dstbus + 
         	 			"/Lconn1');\n";
         	 mConfig += "add_line(fname,'" + powersystem.lines[i].name + "/Rconn2','" + powersystem.lines[i].dstbus + 
         	 			"/Lconn2');\n";
         	 mConfig += "add_line(fname,'" + powersystem.lines[i].name + "/Rconn3','" + powersystem.lines[i].dstbus + 
         	 			"/Lconn3');\n";
         	 mConfig += "set_param([fname '/" + powersystem.lines[i].name + "'],'Resistances','[" + 
         	 			powersystem.lines[i].R1 + ' ' + powersystem.lines[i].R0 + "]','Inductances','[" + l1 + ' ' + l0 + 
         	 			"]','Capacitances','[" + powersystem.lines[i].C1 + ' ' + powersystem.lines[i].C0 + "]','Length','" +
         	 			powersystem.lines[i].Length + "','Position',[" + powersystem.lines[i].pos.x + " " + 
         	 			powersystem.lines[i].pos.y + " " + block_len + " " + block_width + "],'BackgroundColor','Blue')\n";
         	 mConfig += "set_param([fname '/" + measurement + 
         	 		"'],'OutputType','Magnitude','VoltageMeasurement','No','Position',[" + measurement_block_pos_x + 
         	 			" " + measurement_block_pos_y + " " + measurement_block_len + " " + measurement_block_width + 
         	 			"],'BackgroundColor','Black')\n"; 
         }
         mConfig += "%ADD the loads and set their parameters\n";
         for (i = 0; i < powersystem.loads.length; i += 1) {
         	 var block_len = powersystem.loads[i].pos.x + 22;
         	 var block_width = powersystem.loads[i].pos.y + 31;
         	 mConfig += "add_block('powerlib/Elements/Three-Phase Parallel RLC Load',[fname," + "'/" + 
         	 			powersystem.loads[i].name + "'])\n";
         	 mConfig += "add_line(fname,'" + powersystem.loads[i].name + "/Lconn1','" + powersystem.loads[i].destbus + 
         	 			"/Rconn1');\n";
         	 mConfig += "add_line(fname,'" + powersystem.loads[i].name + "/Lconn2','" + powersystem.loads[i].destbus + 
         	 			"/Rconn2');\n";
         	 mConfig += "add_line(fname,'" + powersystem.loads[i].name + "/Lconn3','" + powersystem.loads[i].destbus + 
         	 			"/Rconn3');\n";
         	 mConfig += "set_param([fname '/" + powersystem.loads[i].name + "'],'NominalVoltage','" + 
         	 			powersystem.loads[i].KV + "e3','ActivePower','" + powersystem.loads[i].KW + "e3',";
         	 if (powersystem.loads[i].kvar < 0){
         	 		mConfig += "'InductivePower','0','CapacitivePower','" + Math.abs(powersystem.loads[i].kvar) + 
         	 				   "e3','Position',[" + powersystem.loads[i].pos.x + " " + powersystem.loads[i].pos.y + " " + 
         	 				   block_len + " " + block_width + "],'BackgroundColor','Yellow')\n";
         	 }
         	 else{
         	 		mConfig += "'CapacitivePower','0','InductivePower','" + powersystem.loads[i].kvar + "e3','Position',[" + 
         	 				   powersystem.loads[i].pos.x + " " + powersystem.loads[i].pos.y + " " + block_len + " " + 
         	 				   block_width + "],'BackgroundColor','Yellow')\n";
         	 }
         	 			
         }
         mConfig += "%ADD the faults and set their parameters\n";
         for (i = 0; i < powersystem.faults.length; i += 1) {
         	 var block_len = powersystem.faults[i].pos.x + 22;
         	 var block_width = powersystem.faults[i].pos.y + 31;
         	 mConfig += "add_block('powerlib/Elements/Three-Phase Fault',[fname," + "'/" + 
         	 			powersystem.faults[i].name + "'])\n";
         	 mConfig += "add_line(fname,'" + powersystem.faults[i].name + "/Lconn1','" + powersystem.faults[i].sourcebuss + 
         	 			"/Rconn1');\n";
         	 mConfig += "add_line(fname,'" + powersystem.faults[i].name + "/Lconn2','" + powersystem.faults[i].sourcebuss + 
         	 			"/Rconn2');\n";
         	 mConfig += "add_line(fname,'" + powersystem.faults[i].name + "/Lconn3','" + powersystem.faults[i].sourcebuss + 
         	 			"/Rconn3');\n";
         	 mConfig += "set_param([fname '/" + powersystem.faults[i].name + "'],'FaultResistance','" + powersystem.faults[i].R + 
         	 			"','Position',[" + powersystem.faults[i].pos.x + " " + powersystem.faults[i].pos.y + " " + block_len + 
         	 			" " + block_width + "])\n";
         }
         mConfig += "%ADD the transformers and set their parameters\n";
         for (i = 0; i < powersystem.transformers.length; i += 1) {
         	 var block_len = powersystem.transformers[i].pos.x + 22;
         	 var block_width = powersystem.transformers[i].pos.y + 31;
         	 var transformer_voltages = powersystem.transformers[i].kvs.split(" ");
         	 mConfig += "add_block('powerlib/Elements/Three-Phase Transformer (Two Windings)',[fname," + "'/" + 
         	 			powersystem.transformers[i].name + "'])\n";
         	 mConfig += "add_line(fname,'" + powersystem.transformers[i].name + "/Lconn1','" + 
         	 			powersystem.transformers[i].source_bus + "/Rconn1');\n";
         	 mConfig += "add_line(fname,'" + powersystem.transformers[i].name + "/Lconn2','" + 
         	 			powersystem.transformers[i].source_bus + "/Rconn2');\n";
         	 mConfig += "add_line(fname,'" + powersystem.transformers[i].name + "/Lconn3','" + 
         	 			powersystem.transformers[i].source_bus + "/Rconn3');\n";
         	 mConfig += "add_line(fname,'" + powersystem.transformers[i].name + "/Rconn1','" + 
         	 			powersystem.transformers[i].Dest_name + "/Lconn1');\n";
         	 mConfig += "add_line(fname,'" + powersystem.transformers[i].name + "/Rconn2','" + 
         	 			powersystem.transformers[i].Dest_name + "/Lconn2');\n";
         	 mConfig += "add_line(fname,'" + powersystem.transformers[i].name + "/Rconn3','" + 
         	 			powersystem.transformers[i].Dest_name + "/Lconn3');\n";
         	 mConfig += "set_param([fname '/" + powersystem.transformers[i].name + "'],'NominalPower','[" + 
         	 			powersystem.transformers[i].mva + "e6 " + powersystem.sources[0].freq + "]','Winding1','[ " + 
         	 			transformer_voltages[0] + "e3, " + powersystem.transformers[i].R1 + ", " + powersystem.transformers[i].L1 
         	 			+ " ]','Winding2','[ " + transformer_voltages[1] + "e3, " + powersystem.transformers[i].R2 + 
         	 			", " + powersystem.transformers[i].L2 + " ]','Position',[" + powersystem.transformers[i].pos.x + " " + 
         	 			powersystem.transformers[i].pos.y + " " + block_len + " " + block_width + "],'BackgroundColor','Gray')\n";
         }
         mConfig += "set_param([fname '/powergui'],'SimulationMode','Phasor')\n"; 
         mConfig += 'save_system(fname);' + "\n";
         //self.logger.info(mConfig);  
		
		/** Generating the artifacts
                */
         	var artifact = self.blobClient.createArtifact('PowerSystem_Matlab');
                // Upload the files to server.
                artifact.addFiles({
                    'Matlab_output.json': JSON.stringify(powersystem,null,5),
                    'Matlab_model.txt': mConfig,
                    'matlab_model_generator.m': mConfig
                }, function (err) {
                    if (err) {
                        callback(err);
                        return
                    }
                    // Save the artifact (uploads meta data about the file(s) within in it).
                    artifact.save(function (err, hash) {
                        if (err) {
                            callback(err);
                            return
                        }

                        // Add a link to the artifact to the plugin-result.
                        self.result.addArtifact(hash);

                        self.result.setSuccess(true);
                        callback(null, self.result);
                    })
                });

			
            //self.result.setSuccess(true);
            //callback(null, self.result);
        });

		

        //self.core.setAttribute(nodeObject, 'name', 'My new obj');
        //self.core.setRegistry(nodeObject, 'position', {x: 70, y: 70});


        // This will save the changes. If you don't want to save;
        // exclude self.save and call callback directly from this scope.
        //self.save('Matlab_Code_Generator updated model.')
        //    .then(function () {
        //       self.result.setSuccess(true);
        //        callback(null, self.result);
        //    })
        //    .catch(function (err) {
                // Result success is false at invocation.
        //        callback(err, self.result);
        //    });

    };
    
    /** Constraint check
    */
    Matlab_Code_Generator.prototype.checkViolations = function (nodes, childrenPaths) {
    	var self = this,
    		result, object_names = {},i;
    	for (i=0; i < childrenPaths.length; i += 1) {
                var childNode = nodes[childrenPaths[i]];
                if ((self.isMetaTypeOf(childNode, self.META.Source) === true) || (self.isMetaTypeOf(childNode, self.META.TransmissionLine) === true) || (self.isMetaTypeOf(childNode, self.META.Transformer) === true) || (self.isMetaTypeOf(childNode, self.META.Load) === true) || (self.isMetaTypeOf(childNode, self.META.Fault) === true) || (self.isMetaTypeOf(childNode, self.META.Bus) === true)){
                	var nam = self.core.getAttribute(childNode, 'name');
                	if (object_names[nam]){
                		result = 'Cannot use same name for two objects - check details';
                		self.createMessage(object_names[nam], 'Has duplicate name "' +
                		nam + '".', 'error');
                		
                		}
                	else{
                		object_names[nam] = childNode;
                		}
                   }
                }
                
    	// iterate over children and check names etc.
    	//result = 'same name found, check details';
    	//self.createMessage(self.activeNode, 'someName', 'error');
    	
    	return result;
    }
	
    return Matlab_Code_Generator;
});
