/* File name: main.js
 * Author: Tlotlego Kgatitsoe
 * Date created: 
 * Last modified: 27 January 2020
 * TO:DO, create all note cards view func in line 147
 */

// ******* MODEL ******* //

const model = {
    currentNote: null,
    days: [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ],
    DB_NAME: 'notes_app',
    DB_VERSION: 1,
    defaultNote: {
        title: '',
        text: '',
        lastModified: '',
        id: '',
        isStarred: false
    },
    isNewNote: true,
    LOCAL_STORAGE_DB_KEY: 'ah1h`@#7hyfgh37dji93?>/>',
    LOCAL_STORAGE_NOTES_KEY: 'ggtiek1)kdkk@?<gg}syhdk',
    months: [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],
    nodeEditMenuElem: '',
    notes: [],

    // Resources
    DIALOG_DATA_DELETE_ALL_NOTES: '',
    DIALOG_DATA_DELETE_NOTES: '',
    VIEW_EDIT: '',
    VIEW_HOME: '',

    /**
     * @param { Object } note
     * 
     * Adds the note to the notes in the model
     */
    addNote: note => {
        model.notes.push( note );
    },

    /**
     * @returns { String } msg
     * 
     * Clears all the data that is within the object store and returns a message to the user
     * to notify wether the process was done or has an error
     */
    clearDB: () => {
        return new Promise(( resolve, reject ) => {
            model.openDB().then( db => {
                const transaction = db.transaction( 'notes', 'readwrite' );
                const operation = transaction.objectStore( 'notes' ).clear();
                operation.onsuccess = ( event ) => {
                    db.close();
                    resolve( 'All notes have been deleted.' );
                }
                operation.onerror = () => {
                    db.close();
                    reject( 
                        new Error ( 'There was an error while getting the notes. Please try loading the page again.' )
                    );
                }
            })
        })
    },

    /**
     * @returns { IDBDatabase } db
     * 
     * Creates a database where the notes of the app will be saved. When
     * done it returns the database object
     */
    createDB: () => {
        return new Promise( ( resolve, reject ) => {
            console.log( 'creating db' );
            const req = indexedDB.open( model.DB_NAME, model.DB_VERSION );
            req.onupgradeneeded = event => {
              const db = req.result;
              if ( event.oldVersion < 1 ) {
                db.createObjectStore( 'notes', { keyPath: 'id' } );
              }
            }
            req.onsuccess = event => resolve( event.target.result );
            req.onerror = event => reject( event.error );
        })
    },

    /**
     * @returns { String } noteId
     * 
     * Creates an id for the card of a note that will be used to get the note
     */
    createNoteId: () => {
        const date = new Date();
        return Number( `${ date.getMilliseconds() }${ date.getSeconds() }${ date.getMinutes() }${ date.getHours() }` );
    },
    
    /**
     * @param { Note } note
     * 
     * Deletes the note in the database
     */
    deleteNote: ( note ) => {
        return new Promise(( resolve, reject ) => {
            model.openDB().then( db => {
                let transaction = db.transaction( 'notes', 'readwrite' );
                transaction.objectStore( 'notes' ).delete( note.id );
                transaction.oncomplete = () => {
                    db.close();
                    resolve( 'The note is deleted' );
                }
            });
        })
    },

    /**
     * @param { String } url
     * 
     * Goes to the server and fetches the resource of the specific url
     * @returns { String } data
     * 
     * Goes to the server and finds the page and returns it's data
     */
    fetchResource: async url => {
        const res = await fetch( url );
        if ( !res.ok ) {
            view.showMessage( 'Failed to load data, please reload the page.' );
            throw res.statusText;
        }
        const data = await res.text();
        return data;
    },

    getCurrentNote: () => model.currentNote,
    getDefaultNote: () => model.defaultNote,
    getDays: () => model.days,
    getMonths: () => model.months,
    getNotes: () => model.notes,

    /**
     * @param { Object } noteId
     * @returns { Object } note
     * 
     * Finds a note with an id that is equal to noteId and returns it from
     * model.notes
     */
    getNoteById: ( noteId ) => {
        for ( let note of model.notes ) {
            if ( note.id === noteId ) return note;
        }
    },

    /**
     * @param { String } type
     * Specifies the type of resource that should be returned
     * 
     * @param { String } name
     * Specifies the name of the resource that should be returned
     * 
     * @returns { String } resource
     * 
     * Returns the resouce that is specified by the type and name params
     */
    getResource: ( type, name ) => {
        return model[ `${ type.toUpperCase() }_${ name.toUpperCase() }` ]
    },

    getEditPage: () => model.VIEW_EDIT,
    getHomepage: () => model.VIEW_HOME,
    hasDB: () => localStorage.getItem( model.LOCAL_STORAGE_DB_KEY ),
    hasNotes: () => model.notes.length > 0,

    /**
     * @returns { IDBDatabase } db
     * 
     * Opens a connection to the database and returns it's object
     */
    openDB: () => {
      return new Promise(( resolve, reject ) => {
        const req = indexedDB.open( model.DB_NAME, model.DB_VERSION );
        req.onsuccess = event => resolve( event.target.result );
        req.onerror = event => reject( event.error );
      });
    },

    readNotes: () => {
        return new Promise( ( resolve, reject ) => {
            model.openDB().then( db => {
                const transaction = db.transaction( 'notes', 'readwrite' );
                const operation = transaction.objectStore( 'notes' ).getAll();
                operation.onsuccess = ( event ) => {
                    db.close();
                    resolve( event.target.result );
                }
                operation.onerror = () => {
                    db.close();
                    reject( 
                        new Error ( 'There was an error while getting the notes. Please try loading the page again.' )
                    );
                }
            })
        });
        // indexedDB.deleteDatabase( 'notes_app' );
    },

    /**
     * @param { Note } note
     * 
     * Removes the note from the notes in the model
     */
    removeNote: ( note ) => {
        const notes = model.notes;
        notes.splice( 
            notes.indexOf( model.getNoteById( note.id ) 
        ), 1 );
    },

    /**
     * @returns { String } msg
     * 
     * Saves the note to the database and returns a message that 
     * it was successfully saved
     */
    saveNote: ( note ) => {
        return new Promise(( resolve, reject ) => {
            model.openDB().then( db => {
                let transaction = db.transaction( 'notes', 'readwrite' );
                transaction.objectStore( 'notes' ).put( note );
                transaction.oncomplete = () => {
                    db.close();
                    resolve( 'Note has been saved' );
                }
            })
        })
    },

    setCurrentNote: ( note ) => {
        model.currentNote = note;
    },

    setHasDB: () => {
        localStorage.setItem( model.LOCAL_STORAGE_DB_KEY, true );
    },

    setNotes: ( notes ) => {
        model.notes = notes;
    },

    /**
     * Updates the note in the model's notes
     */
    updatedNote: ( newNote ) => {
        model.notes[ 
            model.notes.indexOf( model.getNoteById( newNote.id ) ) 
        ] = newNote;
    }
};
    
        

// ******* APP ******* //

var app = {
    default: async () => {
        // Set the default time of the snackbar
        view.getSnackbar().timeoutMs = 4000;

        // Check if there is a database, if not create one
        if ( !model.hasDB() ) {
            view.showNoNotesElem();
            model.createDB().then( db => {
                db.close();
                model.setHasDB();
            });
        }

        // Fetches all the data that are needed by the app
        Promise.all([
            model.readNotes(),
            model.fetchResource( '/view/home' ),
            model.fetchResource( '/view/edit' ),
            model.fetchResource( '/data/dialog/deleteAllNotes' ),
            model.fetchResource( '/data/dialog/deleteNote' )
        ]).then( async data => {
            model.setNotes( data[ 0 ] );
            if ( !model.hasNotes() ) {
                view.getContextMenuBtn().style.display = 'none';
            }
            model.VIEW_HOME = data[ 1 ];
            model.VIEW_EDIT = data[ 2 ];
            model.DIALOG_DATA_DELETE_ALL_NOTES = data[ 3 ];
            model.DIALOG_DATA_DELETE_NOTES = data[ 4 ];
            app.setupHomepage();
        })
    },

    /**
     * Creates cards for all the notes in the database
     */
    createAllNoteCards: () => {
        for ( let note of model.getNotes() ) {
            view.createNoteCard( note );
        }
    },

    /**
     * @param { String } currentCardId
     * 
     * Adds an event listener to a note-card in the homepage. It opens up the
     * note and it's data in the edit page. Uses the currentCardId to get the
     * id of the card that was clicked
     */
    createCardClickFunc: currentCardId => {

        // Get the id of the note from the card's id
        const currentNoteId = Number( currentCardId.slice( 8, currentCardId.length ) );

        // Get the note using the id
        model.setCurrentNote( model.getNoteById( currentNoteId ) );
        model.isNewNote = false;

        // Get all the data of the edit page and show it
        view.showPage( model.getResource( 'view', 'edit' ) );
        view.redeclareElems();
        app.setupEditPage();
    },

    /**
     * @param { Date } date
     * @returns { String } lastEdited
     * 
     * Creates a string that shows the last time the note was edited and saved. This string
     * will be used as the secondary text of a note card on the homepage
     */
    createLastModifiedDate: date => {
        let mins = date.getMinutes();
        let hours = date.getHours();
        let day = date.getDate();

        if ( day < 10 ) day = `0${ day }`;
        if ( hours < 10 ) hour = `0${ hours }`;
        if ( mins < 10 ) mins = `0${ mins }`;

        return `
            ${ model.getDays()[ date.getDay() ] }, 
            ${ day } 
            ${ model.getMonths()[ date.getMonth() ] }
            ${ date.getFullYear() } - 
            ${ hours }:${ mins }
        `;
    },

    /**
     * Attaches event listeners to the edit page UI. Checks wether it is a new or an old
     * note that is being opened. If it is a new note it will open the page with both input
     * boxes empty. If it is an old note it opens the page with data of the note visisble
     */
    setupEditPage: () => {
        const arrowBackElem = view.getArrowBackElem();
        const starElem = view.getStarElem();
        const saveElem = view.getSaveElem();

        // Instantiate the textfields
        mdc.textField.MDCTextField.attachTo( document.querySelector( '.note-title' ) );
        mdc.textField.MDCTextField.attachTo( document.querySelector( '.note-text' ) );

        // By default
        view.disableSaveElem();
        view.setupMenuElem();
        view.setupScrim();

        // Adds an event listener to the textarea of the note. It will enable the save elem,
        // to allow the user to save the note, when the texarea's text has been edited.
        const showSave = () => {
            if ( view.isSaveElemDisabled() ) view.enableSaveElem();
        }
        view.getNoteTitleInput().addEventListener( 'input', () => { showSave() });
        view.getNoteTextInput().addEventListener( 'input', () => { showSave() });

        // Adds the data of the note to be displayed with it's title and text
        if ( !model.isNewNote ) {
            const note = model.getCurrentNote();
            const noteTitleInput = view.getNoteTitleInput();
            const noteTextInput = view.getNoteTextInput();

            // Checks if the note is starred or not. If it is starred the star icon will be filled.
            // If the note is not starred the star icon will be outlined
            if ( note.isStarred ) starElem.textContent = 'star';
    
            // Show the title of the note in the input box
            noteTitleInput.focus();
            noteTitleInput.value = note.title;
            noteTitleInput.blur();
    
            // Show the text of the note in the textarea
            noteTextInput.focus();
            noteTextInput.textContent = note.text;
            noteTextInput.blur();
        }

        // Adds a click event listener to the arrow at the top-left of the edit page. This arrow will
        // go back to the homepage
        arrowBackElem.addEventListener( 'click', () => {

            // Check if the snackbar is open. If it is ope close it.
            const snackbar = view.getSnackbar();
            if ( snackbar.isOpen ) snackbar.close();

            // Get the html of the homepage and show it to the screen
            view.showPage( model.getResource( 'view', 'home' ) );
            view.redeclareElems();
            app.setupHomepage();
        });

        // Adds an event listener to the star on the top app bar. When clicked it will toggle between
        // being a filled and outlined star. When filled it indicates that the currently viewed note
        // has been marked as a favourite. When outlined it indicates that the currently viewed note
        // has not been marked as a favourite
        starElem.addEventListener( 'click', () => {
            showSave();

            // Get the note that is currently being edited
            const note = model.getCurrentNote();

            if ( starElem.textContent === 'star_outline' ) {

                // The note was not previously starred, star it
                starElem.textContent = 'star';
                note.isStarred = true;
            } else {
                starElem.textContent = 'star_outline';
                note.isStarred = false;
            }
            model.setCurrentNote( note );
        });

        // Adds an event listener to the icon next to the star in the top app bar. 
        saveElem.addEventListener( 'click', async () => {
            // Get all variables needed for both true and false
            const noteTitleInput = view.getNoteTitleInput();
            const noteTextInput = view.getNoteTextInput();

            // Get the current note, the defualt note
            // is set as the current note for a new note.
            const note = model.getCurrentNote();

            // By default the save elem will still show a ripple around it's elem. 
            // We disable it by blurring the elem.
            saveElem.blur();

            // By default
            view.disableArrowBackElem();
            view.disableSaveElem();

            if ( model.isNewNote ) {

                // Populate the default note with the current data
                note.title = noteTitleInput.value;
                note.text = noteTextInput.value;
                note.lastModified = new Date();
                note.id = model.createNoteId();

                // Save the default note
                const msg = await model.saveNote( note );
                model.addNote( note );
                view.showMessage( msg );
            } else {

                // Update it's data with the lastest user information
                note.title = noteTitleInput.value;
                note.text = noteTextInput.value;
                note.lastModified = new Date();

                // Update the note by saving it in the database
                const msg = await model.saveNote( note );
                model.updatedNote( note );
                model.setCurrentNote( note );
                view.showMessage( msg );
            }
            view.enableArrowBackElem();
        });


        // Adds an event listener to the the menu item that copies the note's text onto the
        // the clipboard
        document.querySelector( '.copy-note' ).addEventListener( 'click', event => {
            navigator.clipboard.writeText( view.getNoteTextInput().value ).then( () => { 
                view.showMessage( 'Note copied.' );
                view.closeMenu();
            }, () => { 
                view.showMessage( 'Failed to copy note, please reload app.' );
                view.closeMenu();
            })
        });

        // Adds an event listener ot the delete note menu option. When clicked it will delete this note
        document.querySelector( '.delete-note' ).addEventListener( 'click', async event => {
            const res = await model.fetchResource( '/component/dialog/deleteNote' );
            if ( !res.ok ) {
                view.showMessage( 'An error occured. Please reload the page.' );
                throw res.statusText;
            }
            const data = await res.json();
            view.showDialog( data, async () => {
                view.closeMenu();
                const note = model.getCurrentNote();
                const msg = await model.deleteNote( note );
                model.removeNote( note );
                view.getArrowBackElem().click();
            });
        });
    },

    /**
     * Attaches event listeners to the homepage UI.
     */
    setupHomepage: () => {
        const fab = view.getFab();
        const deleteAllElem = document.querySelector( '.delete-all' );
        view.setupMenuElem();
        view.setupScrim();

        // Adds an event listener to the menu item to delete all the notes within the object store
        if ( model.hasNotes() ) {
            deleteAllElem.addEventListener( 'click', async () => {
                view.closeMenu();
                const data = model.getResource( 'dialog_data', 'delete_all_notes' );
                view.showDialog( data, async () => {
                    const fab = view.getFab();
                    const msg = await model.clearDB();
                    fab.style.display = 'none';
                    view.showMessage( msg );
                    view.closeMenu();
                    model.setNotes( [] );
                    model.setCurrentNote( null );
                    app.setupHomepage();

                    // Wait for the snackbar to disappear before showing th fab.
                    // Otherwise the snackbar will appear like it's on top of the fab
                    setTimeout(() => {
                        fab.style.display = 'block';
                    }, view.getSnackbar().timeoutMs + 350 );
                });
            })
        } else {
            deleteAllElem.remove();
        }
        
        // Instantiate the fab
        mdc.ripple.MDCRipple.attachTo( document.querySelector( '.add-note' ) );

        // Add an event listener to the fab
        fab.addEventListener( 'click', () => {
            model.isNewNote = true;
            model.setCurrentNote( model.getDefaultNote() );
            view.showPage( model.getResource( 'view', 'edit' ) );
            view.redeclareElems();
            app.setupEditPage();
        });

        // If there are notes, create cards for them. If there are any
        // notes, show the message that there are no notes
        if ( model.hasNotes() ) {
            app.createAllNoteCards();
        } else {
            view.showNoNotesElem();
        }
    }
}

    

 // ******* VIEW ******* //

var view = {
    appNameElem: document.querySelector( '.mdc-top-app-bar__title' ),
    arrowBackElem: document.querySelector( '.arrow-back' ),
    contextMenuBtn: document.querySelector( '.mdc-menu-surface--anchor' ),
    dialog: mdc.dialog.MDCDialog.attachTo( document.querySelector( '.mdc-dialog' ) ),
    fab: document.querySelector( '.add-note' ),
    topAppBar: document.querySelector( '#topAppBar' ),
    main: document.querySelector( 'main' ),
    menu: mdc.menu.MDCMenu.attachTo( document.querySelector( '.mdc-menu.mdc-menu-surface' ) ),
    noNotesFoundDiv: document.querySelector( '#noNotesFound' ),
    notesBarPage: document.querySelector( '#notesBarPage' ),
    noteCardsElem: document.querySelector( '#note-cards' ),
    noteTitleInput: document.querySelector( '.note-title-elem' ),
    noteTextInput: document.querySelector( '.note-text-elem' ),
    noteViewPage: document.querySelector( '#noteViewPage' ),
    saveElem: document.querySelector( '.save' ),
    scrim: document.querySelector( '.mdc-dialog__scrim' ),
    snackbar: mdc.snackbar.MDCSnackbar.attachTo( document.querySelector( '.mdc-snackbar' ) ),
    starElem: document.querySelector( '.star' ),

    /**
     * Closes the context menu of this page
     */
    closeMenu: () => {
        view.menu.open = false;
    },

    /**
     * @param { note } 
     */
    createNoteCard: ( note ) => {
        const cardId = `card-id-${ note.id }`;

        // Checks if the card is starred. If the card is starred it creates it's card with a star.
        // If it is not starred it creates a card without a star. The star is there to tell the user wether
        // the card is starred or not.
        if ( note.isStarred ) {
            view.noteCardsElem.innerHTML +=
            `<div id='${ cardId }' class='mdc-card mdc-card__primary-action' style='position: relative;'>
                <h3 class='card-title'> ${ note.title } </h3>
                <span class="material-icons note-card-star">star</span>
                <span class='card-sec-text'> ${ app.createLastModifiedDate( note.lastModified ) } </span>
            </div>`;
        
            // // Set 
            // const cards = Array.from( document.querySelectorAll( '.card-title' ) );
            // const cardTitleElem = cards[ cards.length - 1 ];
            // const starX = cardTitleElem.nextElementSibling.offsetLeft;
            // const titleX = cardTitleElem.offsetLeft + cardTitleElem.clientWidth;
            // if ( titleX > starX ) {
            //     console.log( 'Too much by', titleX - starX )
            //     while ( titleX > starX ) {
            //         let cardTitle = cardTitleElem.textContent.trim();
            //         cardTitleElem.textContent = cardTitle.substring( 0, cardTitle.length - 2 );
            //         console.log( 'Too much by', titleX - starX )
            //     }
            // } else {
            //     console.log( 'Good enough' )
            // }
        } else {
            view.noteCardsElem.innerHTML +=
            `<div id='${ cardId }' class='mdc-card mdc-card__primary-action' style='position: relative;'>
                <h3 class='card-title'> ${ note.title } </h3>
                <span class='card-sec-text'> ${ app.createLastModifiedDate( note.lastModified ) } </span>
            </div>`;
        }

        // Get the card element and add a click listener that will open the card
        // in the edit page that will allow the card to be edited
        document.querySelector( `#${ cardId }` ).addEventListener( 'click', event => {
            app.createCardClickFunc( event.target.parentElement.id );
        })
    },

    /**
     * Disables the arrow back elem so that the user cannot go to the previous page
     * without the note being properly saved. This avoids many errors.
     */
    disableArrowBackElem: () => {
        view.arrowBackElem.disabled = true;
    },

    /**
     * Disables the save elem so that the user cannot save the note. It will
     * mostly be used after the user has saved a note and not made a change.
     */
    disableSaveElem: () => {
        view.saveElem.disabled = true;
    },

    /**
     * Enables the arrow back elem so that the user can go to the previous page.
     */
    enableArrowBackElem: () => {
        view.arrowBackElem.disabled = false;
    },

    /**
     * Enable's the save elem so that the user can save the note. It will
     * mostly be used after the user has edited the text of the note.
     */
    enableSaveElem: () => {
        view.saveElem.disabled = false;
    },

    getAppNameElem: () => view.appNameElem,
    getArrowBackElem: () => view.arrowBackElem,
    getContextMenuBtn: () => view.contextMenuBtn,
    getDialog: () => view.dialog,
    getFab: () => view.fab,
    getMenu: () => view.menu,
    getNoNotesFoundDiv: () => view.noNotesFoundDiv,
    getNotesBarPage: () => view.notesBarPage,
    getNoteTextInput: () => view.noteTextInput,
    getNoteTitleInput: () => view.noteTitleInput,
    getNoteViewPage: () => view.noteViewPage,
    getSaveElem: () => view.saveElem,
    getScrim: () => view.scrim,
    getSnackbar: () => view.snackbar,
    getStarElem: () => view.starElem,

    /**
     * Hides the dialog of this page
     */
    hideDialog: () => {
        view.dialog.close();
    },

    /**
     * Hides the scrim
     */
    hideScrim: () => {
        view.scrim.style.display = 'none';
    },

    /**
     * @returns { Boolean } open
     * 
     * Returns a boolean that informs wether the menu is open or not
     */
    isMenuOpen: () => view.menu.isOpen,

    /**
     * @returns { Boolean } disabled
     * 
     * Returns a Boolean that notifies whether or not the save elem is disabled
     */
    isSaveElemDisabled: () => view.saveElem.disabled,

    /**
     * Opens the context menu of this page
     */
    openMenu: () => {
        view.menu.open = true;
    },

    /**
     * Gets all the html elements that belong to the view. When the user clicks on the card
     * of a note it goes to the edit view. A lot of html elements become null in this view.
     * The use of this method is to get the html elements again.
     */
    redeclareElems: () => {
        view.appNameElem = document.querySelector( '.mdc-top-app-bar__title' );
        view.arrowBackElem = document.querySelector( '.arrow-back' );
        view.contextMenuBtn = document.querySelector( '.mdc-menu-surface--anchor' );
        view.dialog = mdc.dialog.MDCDialog.attachTo( document.querySelector( '.mdc-dialog' ) );
        view.fab = document.querySelector( '.mdc-fab' );
        view.main = document.querySelector( 'main' );
        view.menu = mdc.menu.MDCMenu.attachTo( document.querySelector( '.mdc-menu.mdc-menu-surface' ) );
        view.noNotesFoundDiv = document.querySelector( '#noNotesFound' );
        view.notesBarPage = document.querySelector( '#notesBarPage' );
        view.noteCardsElem = document.querySelector( '#note-cards' );
        view.noteTitleInput = document.querySelector( '.note-title-elem' );
        view.noteTextInput = document.querySelector( '.note-text-elem' );
        view.noteViewPage = document.querySelector( '#noteViewPage' );
        view.saveElem = document.querySelector( '.save' );
        view.scrim = document.querySelector( '.mdc-dialog__scrim' );
        view.snackbar = mdc.snackbar.MDCSnackbar.attachTo( document.querySelector( '.mdc-snackbar' ) );
        view.starElem = document.querySelector( '.star' );
    },

    /**
     * Adds an event listener to the content menu icon to open the menu when clicked
     */
    setupMenuElem: () => {
        view.getContextMenuBtn().addEventListener( 'click', event => {
            if ( !view.isMenuOpen() && event.target.tagName.toLowerCase() === 'button' ) {
                view.openMenu();
                view.showScrim();
            }
        })
    },

    /**
     * Adds an event listener to the scrim to hide the when clicked
     */
    setupScrim: () => {
        view.scrim.addEventListener( 'click', () => {
            view.hideScrim();
        })
    },

    /**
     * @param { String } data
     * 
     * Adds the data in the param to the elements of the dialog. The data object contains
     * information that will be used in the dialog. 
     * 
     * @param { Function } confirmFunc
     * 
     * The confirmFunc is the function that 
     * will be executed when the user clicks the confirm button.
     */
    showDialog: ( data, confirmFunc ) => {
        document.querySelector( '#my-dialog-title' ).textContent = data.title;
        document.querySelector( '#my-dialog-content' ).textContent = data.supportingText;

        // The reason why we add an event listener for the confirm
        // button only is that the dissmiss "cancel" button is because it closes the dialog 
        // and does nothing by default. We will only add an event listener for the button 
        // where the app will have to do some work.
        const confirmBtn = document.querySelector( '.confirm-btn' );
        confirmBtn.addEventListener( 'click', async () => {
            confirmFunc();
        });
        view.dialog.open();
    },

    /**
     * Shows a message to the user that there are no notes in the database to view
     */
    showNoNotesElem: () => {
        view.noteCardsElem.innerHTML = `<div id='noNotesFound'> No notes to view. </div>`;
    },

    /**
     * @param { String } msg
     * 
     * Shows the message parameter on the snackbar
     */
    showMessage: ( msg ) => {
        view.snackbar.labelText = msg;
        view.snackbar.open();
    },

    /**
     * @param { String } page
     * 
     * It shows the page as the current page by adding them as children in HTML
     */ 
    showPage: ( page ) => {
        view.main.innerHTML = page;
    },

    /**
     * Shows the scrim. It blocks the user from interacting with other UI except the menu.
     * When clicked it hides.
     */
    showScrim: () => {
        view.scrim.style.display = 'block';
    },

    hideNoNotesElem: () => {
        view.noNotesFoundDiv.style.display = 'none';
    }
}
app.default();
console.log( 'mdc', mdc );
// window.onclick = event => {
//     console.log( event.target )
// }