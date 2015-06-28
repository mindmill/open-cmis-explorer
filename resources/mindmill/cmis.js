/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements. See the NOTICE file distributed with this
 * work for additional information regarding copyright ownership. The ASF
 * licenses this file to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

(function(root, factory) {
	'use strict';
	root.cmis = factory();
}(this, function() {
	'use strict';

	/**
	 * @class cmis global object
	 */

	var lib = {};

	/**
	 * @return {CmisSession}
	 * 
	 */
	lib.createSession = function(url) {

		/**
		 * @class CmisSession
		 * 
		 * the session is the enrty point for all cmis requests before making
		 * any request, session.loadRepository() must be invoked
		 * 
		 */
		var session = {};

		/**
		 * sets token for authentication
		 * 
		 * @param {String}
		 *            token
		 * @return {CmisSession}
		 */
		session.setToken = function(token) {
			_token = token;
			return session;
		};

		/**
		 * sets credentials for authentication
		 * 
		 * @param {String}
		 *            username
		 * @param {String}
		 *            password
		 * @return {CmisSession}
		 */
		session.setCredentials = function(username, password) {
			_username = username;
			_password = password;
			return session;
		};

		/**
		 * get credentials for authentication
		 * 
		 * @return username:password
		 */
		session.getCredentials = function() {
			return _username + ":" + _password;
		};

		/**
		 * get token for authentication
		 * 
		 * @return token
		 */
		session.getToken = function() {
			return _token;
		};

		/**
		 * Connects to a cmis server and retrieves repositories, token or
		 * credentials must already be set
		 * 
		 */
		session.loadRepositories = function(options) {
			var _options;
			if (options == null)
				_options = {
					request : {}
				};
			else
				_options = $.extend(true, {}, options);

			_options.request.success = function(data) {
				for ( var repo in data) {
					session.defaultRepository = data[repo];
					break;
				}
				session.repositories = data;

				if (options != null && options.request != null && options.request.success != null)
					options.request.success(data);
			};

			new CmisRequest(_get(url, _options));
		};

		/**
		 * gets an object by objectId
		 * 
		 * @param {String}
		 *            objectId
		 * @param {String}
		 *            returnVersion (if set must be one of 'this', latest' or
		 *            'latestmajor')
		 * @param {Object}
		 *            options (possible options: filter, renditionFilter,
		 *            includeAllowableActions, includeRelationships, includeACL,
		 *            includePolicyIds, succinct, token)
		 */
		session.getObject = function(objectId, returnVersion, options) {
			options = _fill(options);
			options.cmisselector = 'object';
			options.objectId = objectId;
			if (returnVersion && returnVersion != 'this') {
				options.major = (returnVersion == 'latestmajor');
			}
			new CmisRequest(_get(session.defaultRepository.rootFolderUrl, options));
		};

		/**
		 * gets an object by path
		 * 
		 * @param {String}
		 *            path
		 * @param {Object}
		 *            options
		 */
		session.getObjectByPath = function(path, options) {
			options = _fill(options);
			options.cmisselector = 'object';

			new CmisRequest(_get(session.defaultRepository.rootFolderUrl + path, options));
		};

		/**
		 * creates a new folder
		 * 
		 * @param {String}
		 *            parentId
		 * @param {String/Object}
		 *            input if `input` is a string used as the folder name, if
		 *            `input` is an object it must contain required properties:
		 *            {'cmis:name': 'aFolder', 'cmis:objectTypeId':
		 *            'cmis:folder'}
		 */
		session.createFolder = function(parentId, input, policies, addACEs, removeACEs, options) {
			var options = _fill(options);
			if ('string' == typeof input) {
				input = {
					'cmis:name' : input
				};
			}
			var properties = input || {};
			if (!properties['cmis:objectTypeId']) {
				properties['cmis:objectTypeId'] = 'cmis:folder';
			}
			options.objectId = parentId;
			_setProps(properties, options);
			_setACEs(addACEs, 'add', options);
			_setACEs(removeACEs, 'remove', options);
			options.repositoryId = session.defaultRepository.repositoryId;
			options.cmisaction = 'createFolder';
			new CmisRequest(_post(session.defaultRepository.rootFolderUrl, options));
		};

		/**
		 * deletes an object
		 * 
		 * @param {String}
		 *            objectId
		 * @param {Boolean}
		 *            allVersions
		 * @param {Object}
		 *            options (possible options: token)
		 */
		session.deleteObject = function(objectId, allVersions, options) {
			var options = _fill(options);
			options.repositoryId = session.defaultRepository.repositoryId;
			options.cmisaction = 'delete';
			options.objectId = objectId;
			options.allVersions = !!allVersions;

			new CmisRequest(_post(session.defaultRepository.rootFolderUrl, options));
		};

		/**
		 * gets repository informations
		 * 
		 * @param {Object}
		 *            options (possible options: token)
		 */
		session.getRepositoryInfo = function(options) {
			var options = _fill(options);
			options.cmisselector = 'repositoryInfo';
			return new CmisRequest(_get(session.defaultRepository.repositoryUrl, options));
		};

		/**
		 * gets the types that are immediate children of the specified typeId,
		 * or the base types if no typeId is provided
		 * 
		 * @param {String}
		 *            typeId
		 * @param {Boolean}
		 *            includePropertyDefinitions
		 * @param {Object}
		 *            options (possible options: maxItems, skipCount, token)
		 */
		session.getTypeChildren = function(typeId, includePropertyDefinitions, options) {
			options = _fill(options);
			if (typeId) {
				options.typeId = typeId;
			}
			options.includePropertyDefinitions = includePropertyDefinitions;
			options.cmisselector = 'typeChildren'
			new CmisRequest(_get(session.defaultRepository.repositoryUrl, options));
		};

		/**
		 * gets all types descended from the specified typeId, or all the types
		 * in the repository if no typeId is provided
		 * 
		 * @param {String}
		 *            typeId
		 * @param {Integer}
		 *            depth
		 * @param {Boolean}
		 *            includePropertyDefinitions
		 * @param {Object}
		 *            options (possible options: token)
		 */
		session.getTypeDescendants = function(typeId, depth, includePropertyDefinitions, options) {
			options = _fill(options);
			if (typeId) {
				options.typeId = typeId;
			}
			options.depth = depth || 1;
			options.includePropertyDefinitions = includePropertyDefinitions;
			options.cmisselector = 'typeDescendants'
			new CmisRequest(_get(session.defaultRepository.repositoryUrl, options));

		};

		/**
		 * gets definition of the specified type
		 * 
		 * @param {String}
		 *            typeId
		 * @param {Object}
		 *            options (possible options: token)
		 */
		session.getTypeDefinition = function(typeId, options) {
			options = _fill(options);
			options.typeId = typeId;
			options.cmisselector = 'typeDefinition'
			new CmisRequest(_get(session.defaultRepository.repositoryUrl, options));

		};

		/**
		 * gets the documents that have been checked out in the repository
		 * 
		 * @param {String}
		 *            objectId
		 * @param {Object}
		 *            options (possible options: filter, maxItems, skipCount,
		 *            orderBy, renditionFilter, includeAllowableActions,
		 *            includeRelationships, succinct, token)
		 */
		session.getCheckedOutDocs = function(objectId, options) {
			options = _fill(options);
			if (objectId) {
				options.objectId = objectId;
			}
			options.cmisselector = 'checkedOut'
			new CmisRequest(_get(session.defaultRepository.repositoryUrl, options));

		};

		/**
		 * creates a new document
		 * 
		 * @param {String}
		 *            parentId
		 * @param {String/Buffer/Blob}
		 *            content
		 * @param {String/Object}
		 *            input if `input` is a string used as the document name, if
		 *            `input` is an object it must contain required properties:
		 *            {'cmis:name': 'docName', 'cmis:objectTypeId':
		 *            'cmis:document'}
		 * @param {String}
		 *            mimeType
		 * @param {String}
		 *            versioningState (if set must be one of: "none", "major",
		 *            "minor", "checkedout")
		 * @param {Object}
		 *            policies
		 * @param {Object}
		 *            addACEs
		 * @param {Object}
		 *            removeACEs
		 * @param {Object}
		 *            options (possible options: succinct, token)
		 */
		session.createDocument = function(parentId, file, input, mimeType, versioningState, policies, addACEs, removeACEs, options) {
			var options = _fill(options);
			if ('string' == typeof input) {
				input = {
					'cmis:name' : input
				};
			}
			var properties = input || {};
			if (!properties['cmis:objectTypeId']) {
				properties['cmis:objectTypeId'] = 'cmis:document';
			}
			if (versioningState) {
				options.versioningState = versioningState;
			}

			options.objectId = parentId;
			_setProps(properties, options);
			if (addACEs) {
				_setACEs(addACEs, 'add', options);
			}
			if (policies) {
				_setPolicies(policies, options);
			}
			if (removeACEs) {
				_removeACEs(removeACEs, 'remove', options);
			}
			options.repositoryId = session.defaultRepository.repositoryId;
			options.cmisaction = 'createDocument';

			new CmisRequest(_postMultipart(session.defaultRepository.rootFolderUrl, options, file, mimeType, properties['cmis:name']));
		};

		/**
		 * creates a document object as a copy of the given source document
		 * 
		 * @param {String}
		 *            parentId
		 * @param {String}
		 *            sourceId
		 * @param {String/Buffer/Blob}
		 *            content
		 * @param {String/Object}
		 *            input if `input` is a string used as the document name, if
		 *            `input` is an object it must contain required properties:
		 *            {'cmis:name': 'docName', 'cmis:objectTypeId':
		 *            'cmis:document'}
		 * @param {Stirng}
		 *            mimeType
		 * @param {String}
		 *            versioningState (if set must be one of: "none", "major",
		 *            "minor", "checkedout")
		 * @param {Array}
		 *            policies
		 * @param {Object}
		 *            addACEs
		 * @param {Object}
		 *            removeACEs
		 * @param {Object}
		 *            options (possible options: succinct, token)
		 */
		session.createDocumentFromSource = function(parentId, sourceId, content, input, mimeType, versioningState, policies, addACEs, removeACEs, options) {
			var options = _fill(options);
			if ('string' == typeof input) {
				input = {
					'cmis:name' : input
				};
			}
			var properties = input || {};
			if (!properties['cmis:objectTypeId']) {
				properties['cmis:objectTypeId'] = 'cmis:document';
			}
			if (versioningState) {
				options.versioningState = versioningState;
			}
			options.objectId = parentId;
			options.sourceId = sourceId;
			_setProps(properties, options);
			if (addACEs) {
				_setACEs(addACEs, 'add', options);
			}
			if (removeACEs) {
				_removeACEs(removeACEs, 'remove', options);
			}
			if (policies) {
				_setPolicies(policies, options);
			}
			options.repositoryId = session.defaultRepository.repositoryId;
			options.cmisaction = 'createDocumentFromSource';

			new CmisRequest(_postMultipart(session.defaultRepository.rootFolderUrl, options, content, mimeType, properties['cmis:name']));
		};

		/**
		 * Creates a relationship
		 * 
		 * @param {Object}
		 *            properties
		 * @param {Object}
		 *            policies
		 * @param {Object}
		 *            addACEs
		 * @param {Object}
		 *            removeACEs
		 * @param {Object}
		 *            options (possible options: succinct, token)
		 */
		session.createRelationship = function(properties, policies, addACES, removeACEs, options) {
			options = _fill(options);
			_setProps(properties, options);
			if (addACEs) {
				_setACEs(addACEs, 'add', options);
			}
			if (removeACEs) {
				_removeACEs(removeACEs, 'remove', options);
			}
			if (policies) {
				_setPolicies(policies, options);
			}
			options.cmisaction = 'createRelationship';
			new CmisRequest(_post(session.defaultRepository.repositoryUrl, options));
		};

		/**
		 * Creates a policy
		 * 
		 * @param {String}
		 *            folderId
		 * @param {Object}
		 *            properties
		 * @param {Object}
		 *            policies
		 * @param {Object}
		 *            addACEs
		 * @param {Object}
		 *            removeACEs
		 * @param {Object}
		 *            options (possible options: succinct, token)
		 */
		session.createPolicy = function(folderId, properties, policies, addACES, removeACEs, options) {
			options = _fill(options);
			options.objectId = folderId;
			_setProps(properties, options);
			if (addACEs) {
				_setACEs(addACEs, 'add', options);
			}
			if (removeACEs) {
				_removeACEs(removeACEs, 'remove', options);
			}
			if (policies) {
				_setPolicies(policies, options);
			}
			options.cmisaction = 'createPolicy';
			return new CmisRequest(_post(session.defaultRepository.rootFolderUrl).send(options));
		};

		/**
		 * Creates an item
		 * 
		 * @param {String}
		 *            folderId
		 * @param {Object}
		 *            properties
		 * @param {Object}
		 *            policies
		 * @param {Object}
		 *            addACEs
		 * @param {Object}
		 *            removeACEs
		 * @param {Object}
		 *            options (possible options: succinct, token)
		 */
		session.createItem = function(folderId, properties, policies, addACEs, removeACEs, options) {
			options = _fill(options);
			options.objectId = folderId;
			_setProps(properties, options);
			if (addACEs) {
				_setACEs(addACEs, 'add', options);
			}
			if (removeACEs) {
				_removeACEs(removeACEs, 'remove', options);
			}
			if (policies) {
				_setPolicies(policies, options);
			}
			options.cmisaction = 'createItem';
			new CmisRequest(_post(session.defaultRepository.rootFolderUrl, options));
		};

		/**
		 * Updates properties of specified objects
		 * 
		 * @param {Array}
		 *            objectIds
		 * @param {Object}
		 *            properties
		 * @param {Array}
		 *            addSecondaryTypeIds
		 * @param {Array}
		 *            removeSecondaryTypeIds
		 * @param {Options}
		 *            options (possible options: token)
		 */
		session.bulkUpdateProperties = function(objectIds, properties, addSecondaryTypeIds, removeSecondaryTypeIds, options) {
			var options = _fill(options);
			for (var i = objectIds.length - 1; i >= 0; i--) {
				options['objectId[' + i + ']'] = objectIds[i];
			}
			options.objectIds = objectIds;
			_setProps(properties, options);
			if (addSecondaryTypeIds) {
				_setSecondaryTypeIds(addSecondaryTypeIds, 'add', options);
			}
			if (removeSecondaryTypeIds) {
				_setSecondaryTypeIds(removeSecondaryTypeIds, 'remove', options);
			}
			options.cmisaction = 'bulkUpdate';
			new CmisRequest(_post(session.defaultRepository.repositoryUrl, options));

		};

		/**
		 * performs a cmis query against the repository
		 * 
		 * @param {String}
		 *            statement
		 * @param {Boolean}
		 *            searchAllversions
		 * @param {Object}
		 *            options (possible options: maxItems, skipCount, orderBy,
		 *            renditionFilter, includeAllowableActions,
		 *            includeRelationships, succinct, token)
		 */
		session.query = function(statement, searchAllversions, options) {
			options = _fill(options);
			options.cmisaction = 'query';
			options.q = statement;
			options.searchAllversions = !!searchAllversions;
			new CmisRequest(_post(session.defaultRepository.repositoryUrl, options));
		};

		/**
		 * gets the changed objects, the list object should contain the next
		 * change log token.
		 * 
		 * @param {String}
		 *            changeLogToken
		 * @param {Boolean}
		 *            includeProperties
		 * @param {Boolean}
		 *            includePolicyIds
		 * @param {Boolean}
		 *            includeACL
		 * @param {Object}
		 *            options (possible options: maxItems, succinct, token)
		 */
		session.getContentChanges = function(changeLogToken, includeProperties, includePolicyIds, includeACL, options) {
			options = _fill(options);
			options.cmisselector = 'contentChanges';
			if (changeLogToken) {
				options.changeLogToken = changeLogToken;
			}
			options.includeProperties = !!includeProperties;
			options.includePolicyIds = !!includePolicyIds;
			options.includeACL = !!includeACL;
			new CmisRequest(_get(session.defaultRepository.repositoryUrl, options));
		};

		/**
		 * Creates a new type
		 * 
		 * @param {Object}
		 *            type
		 * @param {Object}
		 *            options (possible options: token)
		 * 
		 */
		session.createType = function(type, options) {
			options = _fill(options);
			options.cmisaction = 'createType';
			options.type = JSON.stringify(type);
			return new CmisRequest(_post(session.defaultRepository.repositoryUrl).send(options));
		};

		/**
		 * Updates a type definition
		 * 
		 * @param {Object}
		 *            type
		 * @param {Object}
		 *            options (possible options: token)
		 */
		session.updateType = function(type, options) {
			options = _fill(options);
			options.cmisaction = 'updateType';
			options.type = JSON.stringify(type);
			return new CmisRequest(_post(session.defaultRepository.repositoryUrl).send(options));

		};

		/**
		 * Deletes specified type
		 * 
		 * @param {String}
		 *            typeId
		 * @param {Object}
		 *            options (possible options: token)
		 */
		session.deleteType = function(typeId, options) {
			options = _fill(options);
			options.cmisaction = 'deleteType';
			options.typeId = typeId;
			return new CmisRequest(_post(session.defaultRepository.repositoryUrl).send(options));
		};

		/**
		 * gets last result
		 * 
		 * @param {Object}
		 *            options (possible options: token)
		 */
		session.getLastResult = function(options) {
			options = _fill(options);
			options.cmisaction = 'lastResult';
			new CmisRequest(_get(session.defaultRepository.repositoryUrl, options));
		};

		/**
		 * Returns children of object specified by id
		 * 
		 * @param {String}
		 *            objectId
		 * @param {Object}
		 *            options (possible options: maxItems, skipCount, filter,
		 *            orderBy, renditionFilter, includeAllowableActions,
		 *            includeRelationships, includePathSegment, succinct, token)
		 */
		session.getChildren = function(objectId, options) {
			options = _fill(options);
			options.cmisselector = 'children';
			options.objectId = objectId;
			new CmisRequest(_get(session.defaultRepository.rootFolderUrl, options));
		};

		/**
		 * Gets all descendants of specified folder
		 * 
		 * @param {String}
		 *            folderId
		 * @param {Integer}
		 *            depth
		 * @param {Object}
		 *            options (possible options: filter, renditionFilter,
		 *            includeAllowableActions, includeRelationships,
		 *            includePathSegment, succinct, token)
		 */
		session.getDescendants = function(folderId, depth, options) {
			options = _fill(options);
			options.cmisselector = 'descendants';
			if (depth) {
				options.depth = depth;
			}
			options.objectId = folderId;
			return new CmisRequest(_get(session.defaultRepository.rootFolderUrl, options));
		};

		/**
		 * Gets the folder tree of the specified folder
		 * 
		 * @param {String}
		 *            folderId
		 * @param {Integer}
		 *            depth
		 * @param {Object}
		 *            options (possible options: filter, renditionFilter,
		 *            includeAllowableActions, includeRelationships,
		 *            includePathSegment, succinct, token)
		 */
		session.getFolderTree = function(folderId, depth, options) {
			options = _fill(options);
			options.cmisselector = 'folderTree';
			if (depth) {
				options.depth = depth;
			}
			options.objectId = folderId;

			new CmisRequest(_get(session.defaultRepository.rootFolderUrl, options));
		};

		/**
		 * Gets the parent folder of the specified folder
		 * 
		 * @param {String}
		 *            folderId
		 * @param {Object}
		 *            options (possible options: succinct, token)
		 */
		session.getFolderParent = function(folderId, options) {
			options = _fill(options);
			options.cmisselector = 'parent';
			options.objectId = folderId;
			new CmisRequest(_get(session.defaultRepository.rootFolderUrl, options));
		};

		/**
		 * Gets the folders that are the parents of the specified object
		 * 
		 * @param {String}
		 *            folderId
		 * @param {Object}
		 *            options (possible options: filter, renditionFilter,
		 *            includeAllowableActions, includeRelationships,
		 *            includePathSegment, succinct, token)
		 */
		session.getParents = function(objectId, options) {
			options = _fill(options);
			options.cmisselector = 'parents';
			options.objectId = objectId;
			new CmisRequest(_get(session.defaultRepository.rootFolderUrl, options));
		};

		/**
		 * Gets the allowable actions of the specified object
		 * 
		 * @param {String}
		 *            objectId
		 * @param {Object}
		 *            options (possible options: filter, maxItems, skipCount,
		 *            orderBy, renditionFilter, includeAllowableActions,
		 *            includeRelationships, succinct, token)
		 */
		session.getAllowableActions = function(objectId, options) {
			options = _fill(options);
			options.cmisselector = 'allowableActions';
			options.objectId = objectId;
			new CmisRequest(_get(session.defaultRepository.rootFolderUrl, options));
		};

		/**
		 * Gets the properties of the specified object
		 * 
		 * @param {String}
		 *            objectId
		 * @param {String}
		 *            returnVersion (if set must be one of 'this', latest' or
		 *            'latestmajor')
		 * @param {Object}
		 *            options (possible options: filter, succinct, token)
		 */
		session.getProperties = function(objectId, returnVersion, options) {
			options = _fill(options);
			options.cmisselector = 'properties';
			options.objectId = objectId;
			if (returnVersion && returnVersion != 'this') {
				options.major = (returnVersion == 'latestmajor');
			}
			new CmisRequest(_get(session.defaultRepository.rootFolderUrl, options));
		};

		/**
		 * Gets document content, WARNING: will not work for binary files
		 * (images, documents, ecc..)
		 * 
		 * @param {String}
		 *            objectId
		 * @param {Boolean}
		 *            download
		 * @param {Object}
		 *            options (possible options: token)
		 */
		session.getContentStream = function(objectId, download, options) {
			options = _fill(options);
			options.cmisselector = 'content';
			options.objectId = objectId;
			options.download = download;
			new CmisRequest(_get(session.defaultRepository.rootFolderUrl, options), true);
		};

		/**
		 * Gets document content URL
		 * 
		 * @param {String}
		 *            objectId
		 * @param {Boolean}
		 *            download
		 * @param {Object}
		 *            options (possible options: token)
		 * @return String
		 */
		session.getContentStreamURL = function(objectId, download, options) {
			options = _fill(options);
			options.cmisselector = 'content';
			options.objectId = objectId;
			options.download = download;

			var pairs = [];
			for ( var key in options) {
				pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(options[key]));
			}
			var query = pairs.join('&');
			return session.defaultRepository.rootFolderUrl + '?' + query;
		};

		/**
		 * gets document renditions
		 * 
		 * @param {String}
		 *            objectId
		 * @param {Object}
		 *            options (possible options: renditionFilter, maxItems,
		 *            skipCount, token)
		 */
		session.getRenditions = function(objectId, options) {
			options = _fill(options);
			options.cmisselector = 'renditions';
			options.objectId = objectId;
			options.renditionFilter = options.renditionFilter || '*';

			new CmisRequest(_get(session.defaultRepository.rootFolderUrl, options));

		};

		/**
		 * Updates properties of specified object
		 * 
		 * @param {Object}
		 *            properties
		 * @param {Options}
		 *            options (possible options: changeToken, succinct, token)
		 */
		session.updateProperties = function(objectId, properties, options) {
			var options = _fill(options);
			options.objectId = objectId;
			_setProps(properties, options);
			options.cmisaction = 'update';

			// We first need to get properties to check if there is a change
			// token or not
			session.getProperties(objectId, 'this', {
				request : {
					success : function(data) {
						if (data["cmis:changeToken"] != null && data["cmis:changeToken"].value != null) {
							options.changeToken = data["cmis:changeToken"].value;
						}
						new CmisRequest(_post(session.defaultRepository.rootFolderUrl + "?objectId=" + objectId, options));
					}
				}
			});

		};

		/**
		 * Moves an object
		 * 
		 * @param {String}
		 *            objectId
		 * @param {String}
		 *            targeFolderId
		 * @param {String}
		 *            sourceFolderId
		 * @param {Object}
		 *            options (possible options: succinct, token)
		 */
		session.moveObject = function(objectId, sourceFolderId, targetFolderId, options) {
			var options = _fill(options);
			options.objectId = objectId;
			options.cmisaction = 'move';
			options.targetFolderId = targetFolderId;
			options.sourceFolderId = sourceFolderId;
			new CmisRequest(_post(session.defaultRepository.rootFolderUrl, options));
		};

		/**
		 * Deletes a folfder tree
		 * 
		 * @param {String}
		 *            objectId
		 * @param {Boolean}
		 *            allVersions
		 * @param {String}
		 *            unfileObjects (if set must be one of 'unfile',
		 *            'deletesinglefiled', 'delete')
		 * @param {Boolean}
		 *            continueOnFailure
		 * @param {Object}
		 *            options (possible options: token)
		 */
		session.deleteTree = function(objectId, allVersions, unfileObjects, continueOnFailure, options) {
			var options = _fill(options);
			options.repositoryId = session.defaultRepository.repositoryId;
			options.cmisaction = 'deleteTree';
			options.objectId = objectId;
			options.allVersions = !!allVersions;
			if (unfileObjects) {
				options.unfileObjects = unfileObjects;
			}
			options.continueOnFailure = !!continueOnFailure;
			new CmisRequest(_post(session.defaultRepository.rootFolderUrl, options));

		};

		/**
		 * Updates content of document
		 * 
		 * @param {String}
		 *            objectId
		 * @param {String/Buffer}
		 *            content
		 * @param {Boolean}
		 *            overwriteFlag
		 * @param {String}
		 *            mimeType
		 * @param changeToken
		 * @param {Object}
		 *            options (possible options: changeToken, succinct, token)
		 */
		session.setContentStream = function(objectId, content, overwriteFlag, mimeType, options) {
			var options = _fill(options);
			options.objectId = objectId;
			options.overwriteFlag = !!overwriteFlag;
			options.cmisaction = 'setContent';

			// We first need to get properties to check if there is a change
			// token or not
			session.getProperties(objectId, 'this', {
				request : {
					success : function(data) {
						if (data["cmis:changeToken"] != null && data["cmis:changeToken"].value != null) {
							options.changeToken = data["cmis:changeToken"].value;
							new CmisRequest(_postMultipart(session.defaultRepository.rootFolderUrl, options, content, mimeType));
						}
					}
				}
			});

		};

		/**
		 * Appends content to document
		 * 
		 * @param {String}
		 *            objectId
		 * @param {String/Buffer}
		 *            content
		 * @param {Boolean}
		 *            isLastChunk
		 * @param {Object}
		 *            options
		 * @return {CmisRequest} (possible options: changeToken, succinct,
		 *         token)
		 */
		session.appendContentStream = function(objectId, content, isLastChunk, options) {
			var options = _fill(options);
			options.objectId = objectId;
			options.cmisaction = 'appendContent';
			options.isLastChunk = !!isLastChunk;
			new CmisRequest(_postMultipart(session.defaultRepository.rootFolderUrl, options, content));
		};

		/**
		 * deletes object content
		 * 
		 * @param {String}
		 *            objectId
		 * @param {Object}
		 *            options (possible options: changeToken, succinct, token)
		 */
		session.deleteContentStream = function(objectId, options) {
			var options = _fill(options);
			options.objectId = objectId;
			options.cmisaction = 'deleteContent';
			return new CmisRequest(_post(session.defaultRepository.rootFolderUrl).send(options));
		};

		/**
		 * Adds specified object to folder
		 * 
		 * @param {String}
		 *            objectId
		 * @param {String}
		 *            folderId
		 * @param {Boolean}
		 *            allVersions
		 * @param {Object}
		 *            options (possible options: succinct, token)
		 */
		session.addObjectToFolder = function(objectId, folderId, allVersions, options) {
			var options = _fill(options);
			options.objectId = objectId;
			options.cmisaction = 'addObjectToFolder';
			options.allVersions = !!allVersions;
			options.folderId = folderId;
			new CmisRequest(_post(session.defaultRepository.rootFolderUrl, options));
		};

		/**
		 * Removes specified object from folder
		 * 
		 * @param {String}
		 *            objectId
		 * @param {String}
		 *            folderId
		 * @param {Object}
		 *            options (possible options: succinct, token)
		 */
		session.removeObjectFromFolder = function(objectId, folderId, options) {
			var options = _fill(options);
			options.objectId = objectId;
			options.cmisaction = 'removeObjectFromFolder';
			options.folderId = folderId;
			new CmisRequest(_post(session.defaultRepository.rootFolderUrl, options));
		};

		/**
		 * checks out a document
		 * 
		 * @param {String}
		 *            objectId
		 * @param {Object}
		 *            options
		 */
		session.checkOut = function(objectId, options) {
			var options = _fill(options);
			options.objectId = objectId;
			options.cmisaction = 'checkOut';
			new CmisRequest(_post(session.defaultRepository.rootFolderUrl, options));

		};

		/**
		 * cancels a check out
		 * 
		 * @param {String}
		 *            objectId
		 * @param {Object}
		 *            options (possible options: token)
		 */
		session.cancelCheckOut = function(objectId, options) {
			var options = _fill(options);
			options.objectId = objectId;
			options.cmisaction = 'cancelCheckOut';
			new CmisRequest(_post(session.defaultRepository.rootFolderUrl, options));

		};

		/**
		 * checks in a document, if needed mimetype may be specified as
		 * input['cmis:contentStreamMimeType'] or as option.mimeType
		 * 
		 * @param {String}
		 *            objectId
		 * @param {Boolean}
		 *            major
		 * @param {String/Object}
		 *            input if `input` is a string used as the document name, if
		 *            `input` is an object it must contain required properties:
		 *            {'cmis:name': 'docName'}
		 * @param {String/Buffer}
		 *            content
		 * @param {String}
		 *            comment
		 * @param {Array}
		 *            policies
		 * @param {Object}
		 *            addACEs
		 * @param {Object}
		 *            removeACEs
		 * @param {Object}
		 *            options
		 */
		session.checkIn = function(objectId, major, input, content, comment, policies, addACEs, removeACEs, options) {
			var options = _fill(options);
			if ('string' == typeof input) {
				input = {
					'cmis:name' : input
				};
			}
			var properties = input || {};
			if (comment) {
				options.checkInComment = comment;
			}
			options.major = !!major;
			options.objectId = objectId;
			_setProps(properties, options);
			if (addACEs) {
				_setACEs(addACEs, 'add', options);
			}
			if (removeACEs) {
				_setACEs(removeACEs, 'remove', options);
			}
			if (policies) {
				_setPolicies(policies, options);
			}

			options.cmisaction = 'checkIn';

			new CmisRequest(_postMultipart(session.defaultRepository.rootFolderUrl, options, content, options.mimeType || properties['cmis:contentStreamMimeType'], properties['cmis:name']));

		};

		/**
		 * gets versions of object
		 * 
		 * @param {Object}
		 *            options (possible options: filter,
		 *            includeAllowableActions, succinct, token)
		 */
		session.getAllVersions = function(objectId, options) {
			var options = _fill(options);
			options.objectId = objectId;
			options.cmisselector = 'versions';
			new CmisRequest(_get(session.defaultRepository.rootFolderUrl, options));

		};

		/**
		 * gets object relationships
		 * 
		 * @param {String}
		 *            objectId
		 * @param {Boolean}
		 *            includeSubRelationshipTypes
		 * @param {String}
		 *            relationshipDirection
		 * @param {String}
		 *            typeId
		 * @param {Object}
		 *            options (possible options: maxItems, skipCount,
		 *            includeAllowableActions, filter, succinct, token)
		 */
		session.getObjectRelationships = function(objectId, includeSubRelationshipTypes, relationshipDirection, typeId, options) {
			var options = _fill(options);
			options.objectId = objectId;
			options.includeSubRelationshipTypes = !!includeSubRelationshipTypes;
			options.relationshipDirection = relationshipDirection || 'either';
			if (typeId) {
				options.typeId = typeId;
			}
			options.cmisselector = 'relationships';
			new CmisRequest(_get(session.defaultRepository.rootFolderUrl, options));
		};

		/**
		 * gets object applied policies
		 * 
		 * @param {String}
		 *            objectId
		 * @param {Object}
		 *            options (possible options: filter, succinct, token)
		 */
		session.getAppliedPolicies = function(objectId, options) {
			var options = _fill(options);
			options.objectId = objectId;
			options.cmisselector = 'policies';
			new CmisRequest(_get(session.defaultRepository.rootFolderUrl, options));
		};

		/**
		 * applies policy to object
		 * 
		 * @param {String}
		 *            objectId
		 * @param {String}
		 *            policyId
		 * @param {Object}
		 *            options (possible options: succinct, token)
		 */
		session.applyPolicy = function(objectId, policyId, options) {
			var options = _fill(options);
			options.objectId = objectId;
			options.policyId = policyId;
			options.cmisaction = 'applyPolicy';
			new CmisRequest(_post(session.defaultRepository.rootFolderUrl, options));
		};

		/**
		 * removes policy from object
		 * 
		 * @param {String}
		 *            objectId
		 * @param {String}
		 *            policyId
		 * @param {Object}
		 *            options (possible options: succinct, token)
		 */
		session.removePolicy = function(objectId, policyId, options) {
			var options = _fill(options);
			options.objectId = objectId;
			options.policyId = policyId;
			options.cmisaction = 'removePolicy';
			return new CmisRequest(_post(session.defaultRepository.rootFolderUrl).send(options));

		};

		/**
		 * applies ACL to object
		 * 
		 * @param {String}
		 *            objectId
		 * @param {Object}
		 *            addACEs
		 * @param {Object}
		 *            removeACEs
		 * @param {String}
		 *            propagation
		 * @param {Object}
		 *            options (possible options: token)
		 */
		session.applyACL = function(objectId, addACEs, removeACEs, propagation, options) {
			var options = _fill(options);
			options.objectId = objectId;
			options.propagation = propagation;
			options.cmisaction = 'applyACL';
			_setACEs(addACEs, 'add', options);
			_setACEs(removeACEs, 'remove', options);
			new CmisRequest(_post(session.defaultRepository.rootFolderUrl, options));
		};

		/**
		 * gets object ACL
		 * 
		 * @param {String}
		 *            objectId
		 * @param {Boolean}
		 *            onlyBasicPermissions
		 * @param {Object}
		 *            options (possible options: token)
		 */
		session.getACL = function(objectId, onlyBasicPermissions, options) {
			var options = _fill(options);
			options.objectId = objectId;
			options.onlyBasicPermissions = !!onlyBasicPermissions;
			options.cmisselector = 'acl';
			new CmisRequest(_get(session.defaultRepository.rootFolderUrl, options));
		};

		/**
		 * @class CmisRequest jQuery wrapper used to manage async requests
		 */
		function CmisRequest(req) {
			$.ajax(req);
		}

		// Private members and methods
		var _url = url;
		var _token = null;
		var _username = null;
		var _password = null;
		var _afterlogin;

		var _http = function(method, options, url) {
			var r = {
				type : method,
				dataType : "json",
				url : url,
				data : options,
				crossDomain : true
			};

			// If the basic authentication is configured
			if (_username && _password) {
				var tok = _username + ":" + _password;
				var hash = btoa(tok);
				if (!r.headers)
					r.headers = new Object();
				r.headers["Authorization"] = "Basic " + hash;
			}

			// If we use the authentication with token
			if (_token) {
				var tokenName = Object.keys(_token)[0];
				var tokenValue = _token[tokenName];

				if (method == "GET")
					r.data[tokenName] = tokenValue;
				else {
					// Append the ticket in the URL
					if (r.url.indexOf("?") > -1)
						r.url += "&" + tokenName + "=" + tokenValue;
					else
						r.url += "?" + tokenName + "=" + tokenValue;
				}
			}

			// Merge with options.request
			if (!(typeof options === 'undefined') && !(typeof options.request === 'undefined')) {
				for ( var attrName in options.request) {
					r[attrName] = options.request[attrName];
				}

				// Delete request options
				delete r.data.request;
			}

			return r;
		};

		var _get = function(url, options) {
			return _http('GET', options, url);
		};

		var _post = function(url, options) {
			return _http('POST', options, url);
		};

		var _postMultipart = function(url, options, file, mimeType) {
			var req = _post(url, options);

			var data = new FormData();
			if (file)
				data.append('content', file);
			for ( var k in options) {
				data.append(k, options[k]);
			}

			req.data = data;
			req.contentType = false;
			req.processData = false;

			return req;
		}

		var _defaultOptions = {
		// succinct : true
		};

		var _fill = function(options) {
			var o = {};
			for ( var k in _defaultOptions) {
				o[k] = _defaultOptions[k];
			}
			if (options === undefined) {
				return o;
			}
			for (k in options) {
				o[k] = options[k];
			}

			return o;
		};

		var _setProps = function(properties, options) {
			var i = 0;
			for ( var id in properties) {
				options['propertyId[' + i + ']'] = id;
				options['propertyValue[' + i + ']'] = properties[id];
				i++;
			}
		};

		var _setPolicies = function(policies, options) {
			for (var i = 0; i < policies.length; i++) {
				options['policy[' + i + ']'] = policies[i];
			}
		};

		// action must be either 'add' or 'remove'
		var _setACEs = function(ACEs, action, options) {
			var i = 0;
			for ( var id in ACEs) {
				options[action + 'ACEPrincipal[' + i + ']'] = id;
				var ace = ACEs[id];
				for (var j = 0; j < ace.length; j++) {
					options[action + 'ACEPermission[' + i + '][' + j + ']'] = ACEs[id][j];
				}
				i++;
			}
		};

		// action must be either 'add' or 'remove'
		var _setSecondaryTypeIds = function(secondaryTypeIds, action, options) {
			for (var i = 0; i < secondaryTypeIds.length; i++) {
				options[action + 'SecondaryTypeId[' + i + ']'] = secondaryTypeIds[i];
			}
		};

		return session;
	};

	return lib;

}));
