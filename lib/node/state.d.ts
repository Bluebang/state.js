// Type definitions for state.js
// Project: state,js
// Definitions by: David Mesquita-Morris <http://state.software>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/**
 * An enumeration used to dictate the behavior of instances of the [[PseudoState]] class.
 *
 * Use these constants as the `kind` parameter when creating new [[PseudoState]] instances to define their behavior (see the description of each member).
 */
export declare enum PseudoStateKind {
    /**
     * Enables a dynamic conditional branches; within a compound [[Transition]].
     *
     * All outbound transition guards from a [[Choice]] [[PseudoState]] are evaluated upon entering the [[PseudoState]]:
     * if a single [[Transition]] is found, it will be traversed;
     * if many are found, an arbitary one will be selected and traversed;
     * if none evaluate true, and there is no 'else transition' defined, the machine is deemed illformed and an exception will be thrown.
     */
    Choice = 0,
    /** As per [[ShallowHistory]], but the history semantic cascades through all child regions irrespective of their history semantics. */
    DeepHistory = 1,
    /** Defines the [[PseudoState]] that will be the initial staring point when entering its enclosing [[Region]]. */
    Initial = 2,
    /**
     * Enables a static conditional branches; within a compound [[Transition]].
     * All outbound transition guards from a [[Junction]] [[PseudoState]] are evaluated upon entering the [[PseudoState]]:
     * if a single [[Transition]] is found, it will be traversed;
     * if many or none evaluate true, and there is no 'else transition' defined, the machine is deemed illformed and an exception will be thrown.
     */
    Junction = 3,
    /** Ensures that re-entry of the enclosing [[Region]] will start at the last known active state configuration. */
    ShallowHistory = 4,
    /** Entering a terminate [[PseudoState]] implies that the execution of [[StateMachine]] is terminated and will not respond to any more messages. */
    Terminate = 5,
}
export declare namespace PseudoStateKind {
    /**
     * Tests a [[PseudoState]] to determine if it is a history [[PseudoState]].
     * History [[PseudoState]]s are of kind: [[ShallowHistory]] or [[DeepHistory]].
     * @param kind The [[PseudoStateKind]]
     * @returns True if the [[PseudoStateKind]] is [[DeepHistory]] or [[ShallowHistory]].
     */
    function isHistory(kind: PseudoStateKind): boolean;
    /**
     * Tests a [[PseudoState]] to determine if it is an initial [[PseudoState]].
     * Initial [[PseudoState]]s are of kind: [[Initial]], [[ShallowHistory]], or [[DeepHistory]].
     * @param kind The [[PseudoStateKind]]
     * @returns True if the [[PseudoStateKind]] is [[Initial]], [[DeepHistory]] or [[ShallowHistory]].
     */
    function isInitial(kind: PseudoStateKind): boolean;
}
/**
 * An enumeration of that dictates the precise behavior of a [[Transition]] instance.
 *
 * Use these constants as the `kind` parameter when creating new [[Transition]] instances to define their behavior (see the description of each member).
 * @note Within the [[Transition]] constructor the `kind` parameter will be validated and adjusted as necessary.
 */
export declare enum TransitionKind {
    /** The [[Transition]], if triggered, will exit the source [[Vertex]] and enter the target [[Vertex]] irrespective of the proximity of source and target in terms of their enclosing [[Region]]. */
    External = 0,
    /** The [[Transition]], if triggered, occurs without exiting or entering the source [[State]]; it does not cause a state therefore no [[State]] exit or entry [[Action]]s will be invoked, only [[Transition]] [[Action]]s. */
    Internal = 1,
    /** The [[Transition]], if triggered, will not exit the source [[State]] as the target [[Vertex]] is a child of the source [[State]]. No exit [[Action]]s are invoked from the source [[State]], but [[Transition]] and entry [[Action]]s will be invoked as required. */
    Local = 2,
}
/**
 * An element within a model.
 * @param TParent The type of the [[Element]]s parent.
 */
export declare abstract class Element<TParent> {
    parent: TParent;
    /**
     * Creates a new instance of the [[Element]] class.
     * @param parent The parent of this [[Element]]
     */
    constructor(parent: TParent);
}
/**
 * An element within a model that has a name.
 * @param TParent The type of the [[NamedElement]]s parent.
 */
export declare abstract class NamedElement<TParent> extends Element<TParent> {
    name: string;
    /** The symbol used to separate [[NamedElement]] names within a fully qualified name. Change this static member to create different styles of qualified name generated by the [[toString]] method. */
    static namespaceSeparator: string;
    /** The [[NamedElement]] [[name]] as a namespace delimited by [[namespaceSeparator]]. */
    private qualifiedName;
    /**
     * Creates a new instance of the [[NamedElement]] class.
     * @param name The name of the [[NamedElement]].
     * @param parent The parent of this [[NamedElement]]
     */
    constructor(name: string, parent: TParent);
    /** Returns the [[NamedElement]] [[name]] as a namespace delimited by [[namespaceSeparator]]. */
    toString(): string;
}
/**
 * An [[NamedElement]] within a [[StateMachine]] model that is a container (parent) of [[Vertex]] instances; a [[Region]] will be the child of a composite [[State]].
 * @note A [[Region]] is implicitly inserted into a composite [[State]] if not explicitly defined.
 */
export declare class Region extends NamedElement<State> {
    /** The name given to [[Region]] instances implicitly created (when a [[State]] instance is passed to a [[Vertex]] constructor as it's parent. */
    static defaultName: string;
    /** The [[Vertex]] instances that are children of this [[Region]]. */
    vertices: Vertex[];
    /**
     * Creates a new instance of the [[Region]] class.
     * @param name The name of the [[Region]].
     * @param state The parent [[State]] that this [[Region]] will be a child of.
     */
    constructor(name: string, state: State);
    /** Removes this [[Region]] instance from the [[StateMachine]] model. */
    remove(): void;
    /** Returns the root [[StateMachine]] instance that this [[Region]] is a part of. */
    getRoot(): StateMachine;
    /**
     * Accepts an instance of a [[Visitor]] and calls the [[visitRegion]] method on it.
     * @param TArg1 The type of the first optional parameter.
     * @param visitor The [[Visitor]] instance.
     * @param arg1 An optional argument to pass into the [[Visitor]].
     * @param arg2 An optional argument to pass into the [[Visitor]].
     * @param arg3 An optional argument to pass into the [[Visitor]].
     */
    accept<TArg1>(visitor: Visitor<TArg1>, arg1?: TArg1, arg2?: any, arg3?: any): any;
}
/** An abstract [[NamedElement]] within a [[StateMachine]] model that can be the source or target of a [[Transition]]. */
export declare abstract class Vertex extends NamedElement<Region> {
    /** The [[Transition]]s originating from this [[Vertex]]. */
    outgoing: Transition[];
    /** The [[Transition]]s targeting this [[Vertex]]. */
    incoming: Transition[];
    /**
     * Creates a new instance of the [[Vertex]] class.
     * @param name The name of the [[Vertex]].
     * @param parent The parent [[State]] or [[Region]].
     * @note Specifting a [[State]] as the parent with cause the constructor to make this [[Vertex]] as child of the [[State]]s [[defaultRegion]].
     */
    constructor(name: string, parent: State | Region);
    /** Returns the root [[StateMachine]] instance that this [[Vertex]] is a part of. */
    getRoot(): StateMachine;
    /** Returns the ancestry of the [[Vertex]], form the root [[StateMachine]] to this [[Vertex]]. */
    ancestry(): Array<Vertex>;
    /** Removes the [[Vertex]] from the [[StateMachine]] model. */
    remove(): void;
    /**
     * Creates a new [[Transition]] originating from this [[Vertex]]. Newly created transitions are completion [[Transition]]s; they will be evaluated after a [[Vertex]] has been entered if it is deemed to be complete. The [[Transition]] can be converted to be event triggered by adding a guard condition via the [[Transition]]s where method.
     * @param target The destination of the [[Transition]]; omit for internal [[Transition]]s.
     * @param kind The kind the [[Transition]]; use this to set [[Local]] or [[External]] (the default if omitted) [[Transition]] semantics.
     */
    to(target?: Vertex, kind?: TransitionKind): Transition;
    /**
     * Accepts an instance of a [[Visitor]].
     * @param TArg1 The type of the first optional parameter.
     * @param visitor The [[Visitor]] instance.
     * @param arg1 An optional argument to pass into the [[Visitor]].
     * @param arg2 An optional argument to pass into the [[Visitor]].
     * @param arg3 An optional argument to pass into the [[Visitor]].
     */
    abstract accept<TArg1>(visitor: Visitor<TArg1>, arg1?: TArg1, arg2?: any, arg3?: any): any;
}
/**
 * An [[Vertex]] within a [[StateMachine]] model that represents an transitory [[Vertex]].
 *
 * [[PseudoState]]s are required in state machine models to define the default stating state of a [[Region]]. [[PseudoState]]s are also used for defining history semantics or to facilitate more complex transitions. A [[Terminate]] [[PseudoState]] kind is also available to immediately terminate processing within the entire state machine instance.
 */
export declare class PseudoState extends Vertex {
    kind: PseudoStateKind;
    /**
     * Creates a new instance of the [[PseudoState]] class.
     * @param name The name of the [[PseudoState]].
     * @param parent The parent [[State]] or [[Region]] that this [[PseudoState]] will be a child of.
     * @param kind The kind of the [[PseudoState]] which determines its use and behavior.
     */
    constructor(name: string, parent: State | Region, kind?: PseudoStateKind);
    /**
     * Accepts an instance of a [[Visitor]] and calls the [[visitPseudoState]] method on it.
     * @param visitor The [[Visitor]] instance.
     * @param arg1 An optional argument to pass into the [[Visitor]].
     * @param arg2 An optional argument to pass into the [[Visitor]].
     * @param arg3 An optional argument to pass into the [[Visitor]].
     */
    accept<TArg1>(visitor: Visitor<TArg1>, arg1?: TArg1, arg2?: any, arg3?: any): any;
}
/**
 * A [[Vertex]] within a [[StateMachine]] model that represents an invariant condition within the life of the state machine instance.
 *
 * [[State]] instances are one of the fundamental building blocks of the [[StateMachine]] model; they typically represent conditions where the machine is awaiting an eveny to trigger a [[Transition]]. User-defined [[Action]]s can be defined for both [[State]] entry and [[State]] exit.
 */
export declare class State extends Vertex {
    /** The default [[Region]] if present; created when vertices are created directly under this [[State]]. */
    private defaultRegion;
    /** The [[Region]] instances that are a child of  this [[State]]. */
    regions: Region[];
    /**
     * Creates a new instance of the [[State]] class.
     * @param name The name of the [[State]].
     * @param parent The parent [[State]] or [[Region]] that this [[State is a child of]].
     * @note When a [[State]] is passed as the parent parameter, a default [[Region]] is created and subsiquently accessible via the [[defaultRegion]] method.
     */
    constructor(name: string, parent: State | Region);
    /**
     * Returns the default [[Region]] for the state.
     * @note A default [[Region]] is created on demand if the [[State]] is passed into a child [[Vertex]] constructor..
     */
    getDefaultRegion(): Region;
    /** Tests the [[State]] to see if it is a [[FinalState]]; a [[FinalState]] is either defined by creating an instance of the [[FinalState]] class or any other [[State]] instance that has no outbound transitions. */
    isFinal(): boolean;
    /** Tests the [[State]] to see if it is a simple [[State]]; a simple [[State]] is one that has no child [[Region]]s. */
    isSimple(): boolean;
    /** Tests the [[State]] to see if it is a composite [[State]]; a composite [[State]] is one that has one or more child [[Region]]s. */
    isComposite(): boolean;
    /** Tests the [[State]] to see if it is an orthogonal [[State]]; an orthogonal [[State]] is one that has more than one child [[Region]]s. */
    isOrthogonal(): boolean;
    /** Removes this [[State]] instance from the [[StateMachine]] model. */
    remove(): void;
    /**
     * Adds an [[Action]] that is executed each time the [[State]] instance is exited due to a [[Transition]].
     * @param exitAction The [[Action]] to add to the [[State]] instance exit behavior.
     */
    exit(exitAction: Action): this;
    /**
     * Adds and [[Action]] that is executed each time the [[State]] instance is entered due to a [[Transition]].
     * @param entryAction The [[Action]] to add to the [[State]] instance entry behavior.
     */
    entry(entryAction: Action): this;
    /**
     * Accepts an instance of a [[Visitor]] and calls the [[visitState]] method on it.
     * @param TArg1 The type of the first optional parameter.
     * @param visitor The [[Visitor]] instance.
     * @param arg1 An optional argument to pass into the [[Visitor]].
     * @param arg2 An optional argument to pass into the [[Visitor]].
     * @param arg3 An optional argument to pass into the [[Visitor]].
     */
    accept<TArg1>(visitor: Visitor<TArg1>, arg1?: TArg1, arg2?: any, arg3?: any): any;
}
/**
 * A [[State]] within a [[StateMachine]] model that represents completion of the life of the containing [[Region]] for the state machine instance.
 * @note A [[FinalState]] cannot have outbound transitions.
 */
export declare class FinalState extends State {
    /**
     * Creates a new instance of the [[FinalState]] class.
     * @param name The name of the [[FinalState]].
     * @param parent The parent [[State]] or [[Region]] that owns the [[FinalState]].
     */
    constructor(name: string, parent: State | Region);
    /**
     * Accepts an instance of a [[Visitor]] and calls the [[visitFinalState]] method on it.
     * @param TArg1 The type of the first optional parameter.
     * @param visitor The [[Visitor]] instance.
     * @param arg1 An optional argument to pass into the [[Visitor]].
     * @param arg2 An optional argument to pass into the [[Visitor]].
     * @param arg3 An optional argument to pass into the [[Visitor]].
     */
    accept<TArg1>(visitor: Visitor<TArg1>, arg1?: TArg1, arg2?: any, arg3?: any): any;
}
/** The root of a [[StateMachine]] model. */
export declare class StateMachine extends State {
    /**
     * Creates a new instance of the [[StateMachine]] class.
     * @param name The name of the [[StateMachine]].
     */
    constructor(name: string);
    /**
     * Returns the root [[StateMachine]].
     * @note that if this [[StateMachine]] is embeded within another, the ultimate root will be returned.
     */
    getRoot(): StateMachine;
    /**
     * Accepts an instance of a [[Visitor]] and calls the [[visitStateMachine]] method on it.
     * @param TArg1 The type of the first optional parameter.
     * @param visitor The [[Visitor]] instance.
     * @param arg1 An optional argument to pass into the [[Visitor]].
     * @param arg2 An optional argument to pass into the [[Visitor]].
     * @param arg3 An optional argument to pass into the [[Visitor]].
     */
    accept<TArg1>(visitor: Visitor<TArg1>, arg1?: TArg1, arg2?: any, arg3?: any): any;
}
/**
 * Represents a [[State]] change that may occur in response to a message; essentially, the [[Transition]] represents a path between two [[Vertex]] instances.
 *
 * Transitions come in a variety of types and are described by the [[TransitionKind]] enumeration.
 */
export declare class Transition {
    source: Vertex;
    target: Vertex;
    kind: TransitionKind;
    /**
     * Creates a new instance of the [[Transition]] class.
     * @param source The source [[Vertex]] of the [[Transition]].
     * @param source The target [[Vertex]] of the [[Transition]]; this is an optional parameter, omitting it will create an [[Internal]] [[Transition]].
     * @param kind The kind the [[Transition]]; use this to set [[Local]] or [[External]] (the default if omitted) transition semantics.
     */
    constructor(source: Vertex, target?: Vertex, kind?: TransitionKind);
    /**
     * Turns a [[Transition]] into an else transition.
     * Else [[Transitions]]s can be used at [[Junction]] or [[Choice]] [[PseudoState]] if no other [[Transition]] guards evaluate true, an else [[Transition]] if present will be traversed.
     */
    else(): this;
    /**
     * Defines the guard condition for the [[Transition]].
     * @param guard The guard condition that must evaluate true for the [[Transition]] to be traversed.
     * @note While this supports the fluent API style, multiple calls to the [[when]] method will will just result in the guard condition as specified in last [[when]] call made.
     */
    when(guard: (message?: any, instance?: IInstance) => boolean): this;
    /**
     * Adds and [[Action]] to a [[Transition]].
     * @param transitionAction The [[Action]] to add to the [[Transition]] behavior.
     * @note Make multiple calls to this method to add mutiple actions to the [[Transition]] behavior.
     */
    effect(transitionAction: Action): this;
    /** Removes the [[Transition]] from the [[StateMachine]] model. */
    remove(): void;
    /**
     * Accepts an instance of a [[Visitor]] and calls the [[visitTransition]] method on it.
     * @param TArg1 The type of the first optional parameter.
     * @param visitor The [[Visitor]] instance.
     * @param arg1 An optional argument to pass into the [[Visitor]].
     * @param arg2 An optional argument to pass into the [[Visitor]].
     * @param arg3 An optional argument to pass into the [[Visitor]].
     */
    accept<TArg1>(visitor: Visitor<TArg1>, arg1?: TArg1, arg2?: any, arg3?: any): any;
    /** Returns a the [[Transition]] name. */
    toString(): string;
}
/**
 * A working implementation of the [[IInstance]] interface.
 * @note It is possible to create other custom state machine instance classes in other ways (e.g. as serialisable JSON); just implement the same members and methods as this class.
 */
export declare class StateMachineInstance implements IInstance {
    name: string;
    /** The last known state of any [[Region]] within the state machine instance. */
    private last;
    /** Indicates that the [[StateMachine]] instance reached was terminated by reaching a [[Terminate]] [[PseudoState]]. */
    isTerminated: boolean;
    /**
     * Creates a new instance of the [[StateMachineInstance]] class.
     * @param name The optional name of the [[StateMachineInstance]].
     */
    constructor(name?: string);
    /** Updates the last known [[State]] for a given [[Region]]. */
    setCurrent(region: Region, state: State): void;
    /** Returns the last known [[State]] for a given [[Region]]. */
    getCurrent(region: Region): State;
    /** Returns the name of the [[StateMachineInstance]]. */
    toString(): string;
}
/**
 * Implementation of a visitor pattern.
 * @param TArg1 The type of the first optional parameter in the visit methods.
 */
export declare abstract class Visitor<TArg1> {
    /**
     * Visits a [[NamedElement]] within a [[StateMachine]] model.
     * @param region The [[Vertex]] or [[Region]] being visited.
     * @param arg1 An optional parameter passed into the accept method.
     * @param arg2 An optional parameter passed into the accept method.
     * @param arg3 An optional parameter passed into the accept method.
     */
    visitNamedElement<TParent>(namedElement: Vertex | Region, arg1?: TArg1, arg2?: any, arg3?: any): any;
    /**
     * Visits a [[Region]] within a [[StateMachine]] model.
     * @param region The [[Region]] being visited.
     * @param arg1 An optional parameter passed into the accept method.
     * @param arg2 An optional parameter passed into the accept method.
     * @param arg3 An optional parameter passed into the accept method.
     */
    visitRegion(region: Region, arg1?: TArg1, arg2?: any, arg3?: any): any;
    /**
     * Visits a [[Vertex]] within a [[StateMachine]] model.
     * @param vertex The [[Vertex]] being visited.
     * @param arg1 An optional parameter passed into the accept method.
     * @param arg2 An optional parameter passed into the accept method.
     * @param arg3 An optional parameter passed into the accept method.
     */
    visitVertex(vertex: Vertex, arg1?: TArg1, arg2?: any, arg3?: any): any;
    /**
     * Visits a [[PseudoState]] within a [[StateMachine]] model.
     * @param pseudoState The [[PseudoState]] being visited.
     * @param arg1 An optional parameter passed into the accept method.
     * @param arg2 An optional parameter passed into the accept method.
     * @param arg3 An optional parameter passed into the accept method.
     */
    visitPseudoState(pseudoState: PseudoState, arg1?: TArg1, arg2?: any, arg3?: any): any;
    /**
     * Visits a [[State]] within a [[StateMachine]] model.
     * @param state The [[State]] being visited.
     * @param arg1 An optional parameter passed into the accept method.
     * @param arg2 An optional parameter passed into the accept method.
     * @param arg3 An optional parameter passed into the accept method.
     */
    visitState(state: State, arg1?: TArg1, arg2?: any, arg3?: any): any;
    /**
     * Visits a [[FinalState]] within a [[StateMachine]] model.
     * @param finalState The [[FinalState]] being visited.
     * @param arg1 An optional parameter passed into the accept method.
     * @param arg2 An optional parameter passed into the accept method.
     * @param arg3 An optional parameter passed into the accept method.
     */
    visitFinalState(finalState: FinalState, arg1?: TArg1, arg2?: any, arg3?: any): any;
    /**
     * Visits a [[StateMachine]] within a [[StateMachine]] model.
     * @param state machine The [[StateMachine]] being visited.
     * @param arg1 An optional parameter passed into the accept method.
     * @param arg2 An optional parameter passed into the accept method.
     * @param arg3 An optional parameter passed into the accept method.
     */
    visitStateMachine(model: StateMachine, arg1?: TArg1, arg2?: any, arg3?: any): any;
    /**
     * Visits a [[Transition]] within a [[StateMachine]] model.
     * @param transition The [[Transition]] being visited.
     * @param arg1 An optional parameter passed into the accept method.
     * @param arg2 An optional parameter passed into the accept method.
     * @param arg3 An optional parameter passed into the accept method.
     */
    visitTransition(transition: Transition, arg1?: TArg1, arg2?: any, arg3?: any): any;
}
/**
 * Function prototype for the state transition behavior and [[State]] entry and exit behavior.
 * @param message The message that caused the [[Transition]].
 * @param instance The state machine instance.
 * @param deepHistory True if [[PseudoStateKind.DeepHistory]] semantics are in play.
 */
export interface Action {
    (message?: any, instance?: IInstance, deepHistory?: boolean): any;
}
/** Interface used for logging, warnings and errors; create implementations of this interface and set the [[console]] variable to an instance of it. */
export interface IConsole {
    /**
     * Outputs a log message.
     * @param message The object to log.
     */
    log(message?: any, ...optionalParams: any[]): void;
    /**
     * Outputs a warnnig message.
     * @param message The object to log.
     */
    warn(message?: any, ...optionalParams: any[]): void;
    /**
     * Outputs an error message.
     * @param message The object to log.
     */
    error(message?: any, ...optionalParams: any[]): void;
}
/**
 * The interface used to describe a state machine instance.
 *
 * State machine instances hold the active state configuration for an instance of a [[StateMachine]] model. The state library allows there to be multiple state machine instances for a [[StateMachine]] model. By creating implementations of this interface, you can control how the active state configuration is managed, e.g. if persistence is required.
 */
export interface IInstance {
    /** Indicates that the state machine instance has reached a [[PseudoStateKind.Terminate]] [[PseudoState]] and therfore will no longer respond to messages. */
    isTerminated: boolean;
    /**
     * Updates the last known [[State]] for a given [[Region]].
     * @param region The [[Region]] to update the last known [[State]] for.
     * @param state The last known [[State]] for the given [[Region]].
     */
    setCurrent(region: Region, state: State): void;
    /**
     * Returns the last known [[State]] for a given [[Region]].
     * @param region The [[Region]] to get the last known [[State]] for.
     */
    getCurrent(region: Region): State;
}
/**
 * Tests a [[State]] or [[Region]] within a state machine instance to see if its lifecycle is complete.
 *
 * A [[State]] is deemed complete when it has reached a [[FinalState]] or a [[State]] that has no outgoing [[Transition]]s; a [[Region]] is deemed complete if all its child [[Region]]s are complete.
 * @param stateOrRegion The [[State]] or [[Region]] to test.
 * @param instance The state machine instance.
 */
export declare function isComplete(stateOrRegion: State | Region, instance: IInstance): boolean;
/** The function used for to generate random numbers; may be overriden for testing or other specific purposes. */
export declare let random: (max: number) => number;
/**
 * Initialises a state machine instance and/or [[StateMachine]] model.
 *
 * Passing just the [[StateMachine]] model will initialise the model, passing the [[StateMachine]] model and instance will initialse the instance and if necessary, the model.
 * @param model The [[StateMachine]] model. If autoInitialiseModel is true (or no instance is specified) and the model has changed, the model will be initialised.
 * @param instance The optional state machine instance to initialise.
 * @param autoInitialiseModel Defaulting to true, this will cause the model to be initialised prior to initialising the instance if the model has changed.
 */
export declare function initialise(model: StateMachine, instance?: IInstance, autoInitialiseModel?: boolean): void;
/**
 * Passes a message to a state machine instance for evaluation; a message may trigger a [[Transition]].
 * @param model The [[StateMachine]] model.
 * @param instance The state machine instance.
 * @param message The message to evaluate.
 * @param autoInitialiseModel Defaulting to true, this will cause the [[StateMachine]] model to be initialised prior to initialising the instance if the model has changed.
 * @returns Returns true if the message caused a [[Transition]].
 */
export declare function evaluate(model: StateMachine, instance: IInstance, message: any, autoInitialiseModel?: boolean): boolean;
/**
 * The object used for log, warning and error messages.
 *
 * Assign am object conforming to the [[IConsole]] interface to change the default behavior.
 */
export declare let console: IConsole;
/**
 * Flag to make internal [[Transition]]s trigger completion events for [[State]] they are in.
 *
 * By default, internal [[Transition]]s do not trigger completion events.
 */
export declare let internalTransitionsTriggerCompletion: Boolean;
/**
 * Validates a [[StateMachine]] model for correctness (see the constraints defined within the UML Superstructure specification).
 *
 * Validation warnings and errors are sent to the console.warn and console.error callbacks.
 * @param model The [[StateMachine]] model to validate.
 */
export declare function validate(model: StateMachine): void;
