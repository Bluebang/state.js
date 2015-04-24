/**
 * state v5 finite state machine library
 * http://www.steelbreeze.net/state.cs
 * Copyright (c) 2014-5 Steelbreeze Limited
 * Licensed under the MIT and GPL v3 licences
 */
/**
 * Default namespace for the state.js classes.
 * @module fsm
 */
declare module fsm {
    /**
     * Interface for the state machine instance; an object used as each instance of a state machine (as the classes in this library describe a state machine model).
     * @interface IActiveStateConfiguration
     */
    interface IActiveStateConfiguration {
        /**
         * @member {boolean} isTerminated Indicates that the state machine instance has reached a terminate pseudo state and therfore will no longer evaluate messages.
         */
        isTerminated: boolean;
        /**
         * Updates the last known state for a given region.
         * @method setCurrent
         * @param {Region} region The region to update the last known state for.
         * @param {State} state The last known state for the given region.
         */
        setCurrent(region: Region, state: State): void;
        /**
         * Returns the last known state for a given region.
         * @method getCurrent
         * @param {Region} region The region to update the last known state for.
         * @returns {State} The last known state for the given region.
         */
        getCurrent(region: Region): State;
    }
    /**
     * An abstract class used as the base for the Region and Vertex classes.
     * An element is any part of the tree structure that represents a composite state machine model.
     * @class Element
     */
    class Element {
        name: string;
        /**
         * The symbol used to separate element names within a fully qualified name.
         * Change this static member to create different styles of qualified name generated by the toString method.
         * @member {string}
         */
        static namespaceSeparator: string;
        qualifiedName: string;
        leave: Array<(message: any, instance: IActiveStateConfiguration, history: boolean) => any>;
        beginEnter: Array<(message: any, instance: IActiveStateConfiguration, history: boolean) => any>;
        endEnter: Array<(message: any, instance: IActiveStateConfiguration, history: boolean) => any>;
        enter: Array<(message: any, instance: IActiveStateConfiguration, history: boolean) => any>;
        constructor(name: string);
        getParent(): Element;
        root(): StateMachine;
        ancestors(): Array<Element>;
        isActive(instance: IActiveStateConfiguration): boolean;
        reset(): void;
        bootstrap(deepHistoryAbove: boolean): void;
        /**
         * Returns a the element name as a fully qualified namespace.
         * @method toString
         * @returns {string}
         */
        toString(): string;
    }
    /**
     * An element within a state machine model that is a container of Vertices.
     *
     * Regions are implicitly inserted into composite state machines as a container for vertices.
     * They only need to be explicitly defined if orthogonal states are required.
     *
     * Region extends the Element class and inherits its public interface.
     * @class Region
     * @augments Element
     */
    class Region extends Element {
        parent: State;
        /**
         * The name given to regions that are are created automatically when a state is passed as a vertex's parent.
         * Regions are automatically inserted into state machine models as the composite structure is built; they are named using this static member.
         * Update this static member to use a different name for default regions.
         * @member {string}
         */
        static defaultName: string;
        vertices: Array<Vertex>;
        initial: PseudoState;
        /**
         * Creates a new instance of the Region class.
         * @param {string} name The name of the region.
         * @param {State} parent The parent state that this region will be a child of.
         */
        constructor(name: string, parent: State);
        getParent(): Element;
        /**
         * Tests a region to determine if it is deemed to be complete.
         * A region is complete if its current state is final (a state having on outbound transitions).
         * @method isComplete
         * @param {IActiveStateConfiguration} instance The object representing a particular state machine instance.
         * @returns {boolean} True if the region is deemed to be complete.
         */
        isComplete(instance: IActiveStateConfiguration): boolean;
        bootstrap(deepHistoryAbove: boolean): void;
        bootstrapTransitions(): void;
        evaluate(message: any, instance: IActiveStateConfiguration): boolean;
    }
    /**
     * An abstract element within a state machine model that can be the source or target of a transition (states and pseudo states).
     *
     * Vertex extends the Element class and inherits its public interface.
     * @class Vertex
     * @augments Element
     */
    class Vertex extends Element {
        region: Region;
        transitions: Array<Transition>;
        constructor(name: string, parent: Region);
        constructor(name: string, parent: State);
        getParent(): Element;
        /**
         * Tests the vertex to determine if it is deemed to be complete.
         * Pseudo states and simple states are always deemed to be complete.
         * Composite states are deemed to be complete when all its child regions all are complete.
         * @method isComplete
         * @param {IActiveStateConfiguration} instance The object representing a particular state machine instance.
         * @returns {boolean} True if the vertex is deemed to be complete.
         */
        isComplete(instance: IActiveStateConfiguration): boolean;
        /**
         * Creates a new transition from this vertex.
         * Newly created transitions are completion transitions; they will be evaluated after a vertex has been entered if it is deemed to be complete.
         * Transitions can be converted to be event triggered by adding a guard condition via the transitions `where` method.
         * @method to
         * @param {Vertex} target The destination of the transition; omit for internal transitions.
         * @returns {Transition} The new transition object.
         */
        to(target?: Vertex): Transition;
        bootstrap(deepHistoryAbove: boolean): void;
        bootstrapTransitions(): void;
        evaluateCompletions(message: any, instance: IActiveStateConfiguration, history: boolean): void;
        select(message: any, instance: IActiveStateConfiguration): Transition;
        evaluate(message: any, instance: IActiveStateConfiguration): boolean;
    }
    /**
     * An enumeration of static constants that dictates the precise behaviour of pseudo states.
     *
     * Use these constants as the `kind` parameter when creating new `PseudoState` instances.
     * @class PseudoStateKind
     */
    enum PseudoStateKind {
        /**
         * Used for pseudo states that are always the staring point when entering their parent region.
         * @member {number} Initial
         */
        Initial = 0,
        /**
         * Used for pseudo states that are the the starting point when entering their parent region for the first time; subsequent entries will start at the last known state.
         * @member {number} ShallowHistory
         */
        ShallowHistory = 1,
        /**
         * As per `ShallowHistory` but the history semantic cascades through all child regions irrespective of their initial pseudo state kind.
         * @member {number} DeepHistory
         */
        DeepHistory = 2,
        /**
         * Enables a dynamic conditional branches; within a compound transition.
         * All outbound transition guards from a Choice are evaluated upon entering the PseudoState:
         * if a single transition is found, it will be traversed;
         * if many transitions are found, an arbitary one will be selected and traversed;
         * if none evaluate true, and there is no 'else transition' defined, the machine is deemed illformed and an exception will be thrown.
         * @member {number} Choice
         */
        Choice = 3,
        /**
         * Enables a static conditional branches; within a compound transition.
         * All outbound transition guards from a Choice are evaluated upon entering the PseudoState:
         * if a single transition is found, it will be traversed;
         * if many or none evaluate true, and there is no 'else transition' defined, the machine is deemed illformed and an exception will be thrown.
         * @member {number} Junction
         */
        Junction = 4,
        /**
         * Entering a terminate `PseudoState` implies that the execution of this state machine by means of its state object is terminated.
         * @member {number} Terminate
         */
        Terminate = 5,
    }
    /**
     * An element within a state machine model that represents an transitory Vertex within the state machine model.
     *
     * Pseudo states are required in all state machine models; at the very least, an `Initial` pseudo state is the default stating state when the parent region is entered.
     * Other types of pseudo state are available; typically for defining history semantics or to facilitate more complex transitions.
     * A `Terminate` pseudo state kind is also available to immediately terminate processing within the entire state machine instance.
     *
     * PseudoState extends the Vertex class and inherits its public interface.
     * @class PseudoState
     * @augments Vertex
     */
    class PseudoState extends Vertex {
        kind: PseudoStateKind;
        /**
         * Creates a new instance of the PseudoState class.
         * @param {string} name The name of the pseudo state.
         * @param {Region} parent The parent region that this pseudo state will be a child of.
         * @param {PseudoStateKind} kind Determines the behaviour of the PseudoState.
         */
        constructor(name: string, parent: Region, kind: PseudoStateKind);
        /**
         * Creates a new instance of the PseudoState class.
         * @param {string} name The name of the pseudo state.
         * @param {State} parent The parent state that this pseudo state will be a child of.
         * @param {PseudoStateKind} kind Determines the behaviour of the PseudoState.
         */
        constructor(name: string, parent: State, kind: PseudoStateKind);
        /**
         * Tests the vertex to determine if it is deemed to be complete.
         * Pseudo states and simple states are always deemed to be complete.
         * Composite states are deemed to be complete when all its child regions all are complete.
         * @method isComplete
         * @param {IActiveStateConfiguration} instance The object representing a particular state machine instance.
         * @returns {boolean} True if the vertex is deemed to be complete.
         */
        isComplete(instance: IActiveStateConfiguration): boolean;
        isHistory(): boolean;
        isInitial(): boolean;
        bootstrap(deepHistoryAbove: boolean): void;
        select(message: any, instance: IActiveStateConfiguration): Transition;
    }
    /**
     * An element within a state machine model that represents an invariant condition within the life of the state machine instance.
     *
     * States are one of the fundamental building blocks of the state machine model.
     * Behaviour can be defined for both state entry and state exit.
     *
     * State extends the Vertex class and inherits its public interface.
     * @class State
     * @augments Vertex
     */
    class State extends Vertex {
        exitBehavior: Array<(message: any, instance: IActiveStateConfiguration, history: boolean) => any>;
        entryBehavior: Array<(message: any, instance: IActiveStateConfiguration, history: boolean) => any>;
        regions: Array<Region>;
        /**
         * Creates a new instance of the State class.
         * @param {string} name The name of the state.
         * @param {Region} parent The parent region that owns the state.
         */
        constructor(name: string, parent: Region);
        /**
         * Creates a new instance of the State class.
         * @param {string} name The name of the state.
         * @param {State} parent The parent state that owns the state.
         */
        constructor(name: string, parent: State);
        defaultRegion(): Region;
        isActive(instance: IActiveStateConfiguration): boolean;
        /**
         * Tests the state to see if it is a final state;
         * a final state is one that has no outbound transitions.
         * @method isFinal
         * @returns {boolean} True if the state is a final state.
         */
        isFinal(): boolean;
        /**
         * Tests the state to see if it is a simple state;
         * a simple state is one that has no child regions.
         * @method isSimple
         * @returns {boolean} True if the state is a simple state.
         */
        isSimple(): boolean;
        /**
         * Tests the state to see if it is a composite state;
         * a composite state is one that has one or more child regions.
         * @method isComposite
         * @returns {boolean} True if the state is a composite state.
         */
        isComposite(): boolean;
        /**
         * Tests the state to see if it is an orthogonal state;
         * an orthogonal state is one that has two or more child regions.
         * @method isOrthogonal
         * @returns {boolean} True if the state is an orthogonal state.
         */
        isOrthogonal(): boolean;
        /**
         * Tests a region to determine if it is deemed to be complete.
         * A region is complete if its current state is final (a state having on outbound transitions).
         * @method isComplete
         * @param {IActiveStateConfiguration} instance The object representing a particular state machine instance.
         * @returns {boolean} True if the region is deemed to be complete.
         */
        isComplete(instance: IActiveStateConfiguration): boolean;
        /**
         * Adds behaviour to a state that is executed each time the state is exited.
         * @method exit
         * @param {(message: any, instance: IActiveStateConfiguration, history: boolean) => any} exitAction The action to add to the state's exit behaviour.
         * @returns {State} Returns the state to allow a fluent style API.
         */
        exit<TMessage>(exitAction: (message: any, instance: IActiveStateConfiguration, history: boolean) => any): State;
        /**
         * Adds behaviour to a state that is executed each time the state is entered.
         * @method entry
         * @param {(message: any, instance: IActiveStateConfiguration, history: boolean) => any} entryAction The action to add to the state's entry behaviour.
         * @returns {State} Returns the state to allow a fluent style API.
         */
        entry<TMessage>(entryAction: (message: any, instance: IActiveStateConfiguration, history: boolean) => any): State;
        bootstrap(deepHistoryAbove: boolean): void;
        bootstrapTransitions(): void;
        select(message: any, instance: IActiveStateConfiguration): Transition;
        evaluate(message: any, instance: IActiveStateConfiguration): boolean;
    }
    /**
     * An element within a state machine model that represents completion of the life of the containing Region within the state machine instance.
     *
     * A final state cannot have outbound transitions.
     *
     * FinalState extends the State class and inherits its public interface.
     * @class FinalState
     * @augments State
     */
    class FinalState extends State {
        /**
         * Creates a new instance of the FinalState class.
         * @param {string} name The name of the final state.
         * @param {Region} parent The parent region that owns the final state.
         */
        constructor(name: string, parent: Region);
        /**
         * Creates a new instance of the FinalState class.
         * @param {string} name The name of the final state.
         * @param {State} parent The parent state that owns the final state.
         */
        constructor(name: string, parent: State);
        to(target?: Vertex): Transition;
    }
    /**
     * An element within a state machine model that represents the root of the state machine model.
     *
     * StateMachine extends the State class and inherits its public interface.
     * @class StateMachine
     * @augments State
     */
    class StateMachine extends State {
        clean: boolean;
        /**
         * Creates a new instance of the StateMachine class.
         * @param {string} name The name of the state machine.
         */
        constructor(name: string);
        root(): StateMachine;
        isActive(instance: IActiveStateConfiguration): boolean;
        /**
         * Bootstraps the state machine model; precompiles the actions to take during transition traversal.
         *
         * Bootstrapping a state machine model pre-calculates all the actions required for each transition within the state machine model.
         * The actions will exit all states as appropriate, perform transition behaviour, enter all states as appropriate and update the current state.
         *
         * This is only required if you are dynamically changing the state machine model and want to manually control when the model is bootstrapped.
         * @method bootstrap
         */
        bootstrap(deepHistoryAbove: boolean): void;
        /**
         * Initialises an instance of the state machine and enters its initial pseudo state.
         * Entering the initial pseudo state may cause a chain of other completion transitions.
         * @method initialise
         * @param {IActiveStateConfiguration} instance The object representing a particular state machine instance.
         * @param {boolean} autoBootstrap Set to false to manually control when bootstrapping occurs.
         */
        initialise(instance: IActiveStateConfiguration, autoBootstrap?: boolean): void;
        /**
         * Passes a message to a state machine instance for evaluation.
         *
         * The message will cause the guard conditions of outbound transitions from the current state to be evaluated; if a single guard evaluates true, it will trigger transition traversal.
         * Transition traversal may cause a chain of transitions to be traversed.
         * @method evaluate
         * @param {any} message A message to pass to a state machine instance for evaluation that may cause a state transition.
         * @param {IActiveStateConfiguration} instance The object representing a particular state machine instance.
         * @param {boolean} autoBootstrap Set to false to manually control when bootstrapping occurs.
         * @returns {boolean} True if the method caused a state transition.
         */
        evaluate(message: any, instance: IActiveStateConfiguration, autoBootstrap?: boolean): boolean;
    }
    /**
     * A transition between vertices (states or pseudo states) that may be traversed in response to a message.
     *
     * Transitions come in a variety of types:
     * internal transitions respond to messages but do not cause a state transition, they only have behaviour;
     * local transitions are contained within a single region therefore the source vertex is exited, the transition traversed, and the target state entered;
     * external transitions are more complex in nature as they cross region boundaries, all elements up to but not not including the common ancestor are exited and entered.
     *
     * Entering a composite state will cause the entry of the child regions within the composite state; this in turn may trigger more transitions.
     * @class Transition
     */
    class Transition {
        source: Vertex;
        target: Vertex;
        static isElse: (message: any, instance: IActiveStateConfiguration) => boolean;
        guard: (message: any, instance: IActiveStateConfiguration) => boolean;
        transitionBehavior: Array<(message: any, instance: IActiveStateConfiguration, history: boolean) => any>;
        traverse: Array<(message: any, instance: IActiveStateConfiguration, history: boolean) => any>;
        /**
         * Creates a new instance of the Transition class.
         * @param {Vertex} source The source of the transition.
         * @param {Vertex} source The target of the transition.
         */
        constructor(source: Vertex, target?: Vertex);
        /**
         * Turns a transition into an else transition.
         *
         * Else transitions can be used at `Junction` or `Choice` pseudo states if no other transition guards evaluate true, an Else transition if present will be traversed.
         * @method else
         * @returns {Transition} Returns the transition object to enable the fluent API.
         */
        else(): Transition;
        /**
         * Defines the guard condition for the transition.
         * @method when
         * @param {(message: any, instance: IActiveStateConfiguration) => boolean} guard The guard condition that must evaluate true for the transition to be traversed.
         * @returns {Transition} Returns the transition object to enable the fluent API.
         */
        when(guard: (message: any, instance: IActiveStateConfiguration) => boolean): Transition;
        /**
         * Add behaviour to a transition.
         * @method effect
         * @param {(message: any, instance: IActiveStateConfiguration, history: boolean) => any} transitionAction The action to add to the transitions traversal behaviour.
         * @returns {Transition} Returns the transition object to enable the fluent API.
         */
        effect<TMessage>(transitionAction: (message: any, instance: IActiveStateConfiguration, history: boolean) => any): Transition;
        bootstrap(): void;
    }
    /**
     * Default working implementation of a state machine instance class.
     *
     * Implements the `IActiveStateConfiguration` interface.
     * It is possible to create other custom instance classes to manage state machine state in any way (e.g. as serialisable JSON); just implement the same members and methods as this class.
     * @class Context
     * @implements IActiveStateConfiguration
     */
    class StateMachineInstance implements IActiveStateConfiguration {
        name: string;
        isTerminated: boolean;
        private last;
        constructor(name?: string);
        /**
         * Updates the last known state for a given region.
         * @method setCurrent
         * @param {Region} region The region to update the last known state for.
         * @param {State} state The last known state for the given region.
         */
        setCurrent(region: Region, state: State): void;
        /**
         * Returns the last known state for a given region.
         * @method getCurrent
         * @param {Region} region The region to update the last known state for.
         * @returns {State} The last known state for the given region.
         */
        getCurrent(region: Region): State;
        toString(): string;
    }
}
