"use client"
/// import * as Autodesk from "@types/forge-viewer";
import React from 'react';
import PropTypes from 'prop-types';



const runtime = {
    /** @type {Autodesk.Viewing.InitializerOptions} */
    options: null,
    /** @type {Promise<void>} */
    ready: null
};

/**
 * Initializes global runtime for communicating with Autodesk Platform Services.
 * Calling this function repeatedly with different options is not allowed, and will result in an exception.
 * @async
 * @param {Autodesk.Viewing.InitializerOptions} options Runtime initialization options.
 * @returns {Promise<void>}
 */
function initializeViewerRuntime(options) {
    if (!runtime.ready) {
        const documentPath = './dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6ZGFuaWVsX3ZpZXdlcl90ZXN0aW5nL0Vhc3ktRV9OUFMlMjAxX0NMMTUwJTIwUkZfUGxhaW5fMzBpLnN0ZXA/';
        runtime.options = { ...options };
        runtime.ready = new Promise((resolve) => Autodesk.Viewing.Initializer(runtime.options, resolve));
        // runtime.ready = new Promise((resolve)=>{
        //     // console.log(runtime.options)
        //     // var myViewerDiv = document.getElementById('viewer');
        //     // console.log(myViewerDiv)
        //     // var viewer = new Autodesk.Viewing.Private.GuiViewer3D(myViewerDiv);
        //     // var options = {
        //     //     'env' : 'Local',
        //     //     'document' : documentPath + '/output/1/Easy-E_NPS 1_CL150 RF_Plain_30i.svf'
        //     // };
        //     // Autodesk.Viewing.Initializer(options, function() {
        //     //     viewer.start(options.document, options);
        //     // },resolve);

        //     // var options = {
        //     //     env: 'Local',
        //     //     document: 'http://localhost:3000/dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6ZGFuaWVsX3ZpZXdlcl90ZXN0aW5nL0Vhc3ktRV9OUFMlMjAxX0NMMTUwJTIwUkZfUGxhaW5fMzBpLnN0ZXA/output/1/Easy-E_NPS 1_CL150 RF_Plain_30i.svf',
        //     //     // document: 'http://localhost:3000/dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6ZGFuaWVsX3ZpZXdlcl90ZXN0aW5nL0Vhc3ktRV9OUFMlMjAxX0NMMTUwJTIwUkZfUGxhaW5fMzBpLnN0ZXA/output/1/Easy-E_NPS 1_CL150 RF_Plain_30i.svf',
        //     //     getAccessToken: function(onGetAccessToken) {
        //     //         // If your local files require authentication, handle it here
        //     //         var accessToken = runtime.options.accessToken;
        //     //         var expireTimeSeconds = 3600;
        //     //         onGetAccessToken(accessToken, expireTimeSeconds);
        //     //     }
        //     // };
        //     // const MODEL_URL = options.document;
        //     // Autodesk.Viewing.Initializer({ env: 'Local' }, async function () {
        //     //     const viewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById('viewer'));
        //     //     viewer.start(MODEL_URL);
        //     // },resolve);
        //  })
        
        
        // runtime.ready = new Promise((resolve) => Autodesk.Viewing.Initializer(options, resolve(function() { 
        //     const viewerDiv = document.getElementById('viewer');
        //     const viewer = new Autodesk.Viewing.GuiViewer3D(viewerDiv);
        //     viewer.start();
            
        //     Autodesk.Viewing.Document.load(documentPath, function(doc) {
        //         const rootItem = doc.getRoot();
        //         const geometryItems = Autodesk.Viewing.Document.getSubItemsWithProperties(rootItem, {'type':'geometry'}, true);
        //         viewer.loadDocumentNode(doc, geometryItems[0]);
        //     })
        // })))
            
        
    } else {
        if (['accessToken', 'getAccessToken', 'env', 'api', 'language'].some(prop => options[prop] !== runtime.options[prop])) {
            return Promise.reject('Cannot initialize another viewer runtime with different settings.')
        }
    }
    return runtime.ready;
}

/**
 * Wrapper for the Autodesk Platform Services viewer component.
 */
class Viewer extends React.Component {
    constructor(props) {
        super(props);
        /** @type {HTMLDivElement} */
        this.container = null;
        /** @type {Autodesk.Viewing.GuiViewer3D} */
        this.viewer = null;
    }

    componentDidMount() {
        initializeViewerRuntime(this.props.runtime || {})
            .then(_ => {
                this.viewer = new Autodesk.Viewing.GuiViewer3D(this.container);
                this.viewer.start();
                this.viewer.addEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, this.onViewerCameraChange);
                this.viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, this.onViewerSelectionChange);
                this.updateViewerState({});
            })
            .catch(err => console.error(err));
    }

    componentWillUnmount() {
        if (this.viewer) {
            this.viewer.removeEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, this.onViewerCameraChange);
            this.viewer.removeEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, this.onViewerSelectionChange);
            this.viewer.finish();
            this.viewer = null;
        }
    }

    componentDidUpdate(prevProps) {
        if (this.viewer) {
            this.updateViewerState(prevProps);
        }
    }

    updateViewerState(prevProps) {
        if (this.props.urn && this.props.urn !== prevProps.urn) {
            Autodesk.Viewing.Document.load(
                'urn:' + this.props.urn,
                (doc) => {
                    this.viewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry())
                    let materials = "doc.getRoot().getData().materials";
                    let geometry = doc.getRoot().getDefaultGeometry();
                    let camera = "doc.getRoot().getCamera()";
                    console.log(materials,geometry,camera)
                },
                (code, message, errors) => console.error(code, message, errors)
            );
            try{
                console.log(this.viewer)
                let materials = this.viewer.model.getData().materials;
                let geometry = this.viewer.model.getGeometryList();
                let camera = this.viewer.getCamera();
                console.log(materials,geometry,camera)
            }catch(ex){
                
            }
            
        } else if (!this.props.urn && this.viewer.model) {
            this.viewer.unloadModel(this.viewer.model);
        }

        const selectedIds = this.viewer.getSelection();
        if (JSON.stringify(this.props.selectedIds || []) !== JSON.stringify(selectedIds)) {
            this.viewer.select(this.props.selectedIds);
        }
    }

    onViewerCameraChange = () => {
        if (this.props.onCameraChange) {
            this.props.onCameraChange({ viewer: this.viewer, camera: this.viewer.getCamera() });
        }
    }

    onViewerSelectionChange = () => {
        if (this.props.onSelectionChange) {
            this.props.onSelectionChange({ viewer: this.viewer, ids: this.viewer.getSelection() });
        }
    }

    render() {
        return <div ref={ref => this.container = ref} id="viewer"></div>;
    }
}

Viewer.propTypes = {
    /** Viewer runtime initialization options. */
    runtime: PropTypes.object,
    /** URN of model to be loaded. */
    urn: PropTypes.string,
    /** List of selected object IDs. */
    selectedIds: PropTypes.arrayOf(PropTypes.number),
    /** Callback for when the viewer camera changes. */
    onCameraChange: PropTypes.func,
    /** Callback for when the viewer selectio changes. */
    onSelectionChange: PropTypes.func
};

export default Viewer;
