
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    // Adapted from https://github.com/then/is-promise/blob/master/index.js
    // Distributed under MIT License https://github.com/then/is-promise/blob/master/LICENSE
    function is_promise(value) {
        return !!value && (typeof value === 'object' || typeof value === 'function') && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Schedules a callback to run immediately after the component has been updated.
     *
     * The first time the callback runs will be after the initial `onMount`
     */
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    function construct_svelte_component_dev(component, props) {
        const error_message = 'this={...} of <svelte:component> should specify a Svelte component.';
        try {
            const instance = new component(props);
            if (!instance.$$ || !instance.$set || !instance.$on || !instance.$destroy) {
                throw new Error(error_message);
            }
            return instance;
        }
        catch (err) {
            const { message } = err;
            if (typeof message === 'string' && message.indexOf('is not a constructor') !== -1) {
                throw new Error(error_message);
            }
            else {
                throw err;
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier} [start]
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=} start
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0 && stop) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let started = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (started) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            started = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
                // We need to set this to false because callbacks can still happen despite having unsubscribed:
                // Callbacks might already be placed in the queue which doesn't know it should no longer
                // invoke this derived store.
                started = false;
            };
        });
    }

    function parse(str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules/svelte-spa-router/Router.svelte generated by Svelte v3.59.2 */

    const { Error: Error_1, Object: Object_1, console: console_1 } = globals;

    // (246:0) {:else}
    function create_else_block$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (dirty & /*component*/ 1 && switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(246:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (239:0) {#if componentParams}
    function create_if_block$5(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (dirty & /*component*/ 1 && switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(239:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$5, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getLocation() {
    	const hashPosition = window.location.href.indexOf('#/');

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: '/';

    	// Check if there's a querystring
    	const qsPosition = location.indexOf('?');

    	let querystring = '';

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener('hashchange', update, false);

    	return function stop() {
    		window.removeEventListener('hashchange', update, false);
    	};
    });

    const location = derived(loc, _loc => _loc.location);
    const querystring = derived(loc, _loc => _loc.querystring);
    const params = writable(undefined);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == '#' ? '' : '#') + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == '#' ? '' : '#') + location;

    	try {
    		const newState = { ...history.state };
    		delete newState['__svelte_spa_router_scrollX'];
    		delete newState['__svelte_spa_router_scrollY'];
    		window.history.replaceState(newState, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn('Caught exception while replacing the current page. If you\'re running this in the Svelte REPL, please note that the `replace` method might not work in this environment.');
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event('hashchange'));
    }

    function link(node, opts) {
    	opts = linkOpts(opts);

    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != 'a') {
    		throw Error('Action "link" can only be used with <a> tags');
    	}

    	updateLink(node, opts);

    	return {
    		update(updated) {
    			updated = linkOpts(updated);
    			updateLink(node, updated);
    		}
    	};
    }

    function restoreScroll(state) {
    	// If this exists, then this is a back navigation: restore the scroll position
    	if (state) {
    		window.scrollTo(state.__svelte_spa_router_scrollX, state.__svelte_spa_router_scrollY);
    	} else {
    		// Otherwise this is a forward navigation: scroll to top
    		window.scrollTo(0, 0);
    	}
    }

    // Internal function used by the link function
    function updateLink(node, opts) {
    	let href = opts.href || node.getAttribute('href');

    	// Destination must start with '/' or '#/'
    	if (href && href.charAt(0) == '/') {
    		// Add # to the href attribute
    		href = '#' + href;
    	} else if (!href || href.length < 2 || href.slice(0, 2) != '#/') {
    		throw Error('Invalid value for "href" attribute: ' + href);
    	}

    	node.setAttribute('href', href);

    	node.addEventListener('click', event => {
    		// Prevent default anchor onclick behaviour
    		event.preventDefault();

    		if (!opts.disabled) {
    			scrollstateHistoryHandler(event.currentTarget.getAttribute('href'));
    		}
    	});
    }

    // Internal function that ensures the argument of the link action is always an object
    function linkOpts(val) {
    	if (val && typeof val == 'string') {
    		return { href: val };
    	} else {
    		return val || {};
    	}
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {string} href - Destination
     */
    function scrollstateHistoryHandler(href) {
    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, []);
    	let { routes = {} } = $$props;
    	let { prefix = '' } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != 'function' && (typeof component != 'object' || component._sveltesparouter !== true)) {
    				throw Error('Invalid component object');
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == 'string' && (path.length < 1 || path.charAt(0) != '/' && path.charAt(0) != '*') || typeof path == 'object' && !(path instanceof RegExp)) {
    				throw Error('Invalid value for "path" argument - strings must start with / or *');
    			}

    			const { pattern, keys } = parse(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == 'object' && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, check if it matches the start of the path.
    			// If not, bail early, else remove it before we run the matching.
    			if (prefix) {
    				if (typeof prefix == 'string') {
    					if (path.startsWith(prefix)) {
    						path = path.substr(prefix.length) || '/';
    					} else {
    						return null;
    					}
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || '/';
    					} else {
    						return null;
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || '') || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {boolean} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	let popStateChanged = null;

    	if (restoreScrollState) {
    		popStateChanged = event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && (event.state.__svelte_spa_router_scrollY || event.state.__svelte_spa_router_scrollX)) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		};

    		// This is removed in the destroy() invocation below
    		window.addEventListener('popstate', popStateChanged);

    		afterUpdate(() => {
    			restoreScroll(previousScrollState);
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	const unsubscribeLoc = loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData,
    				params: match && typeof match == 'object' && Object.keys(match).length
    				? match
    				: null
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick('conditionsFailed', detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoading', Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick('routeLoaded', Object.assign({}, detail, {
    						component,
    						name: component.name,
    						params: componentParams
    					}));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == 'object' && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoaded', Object.assign({}, detail, {
    				component,
    				name: component.name,
    				params: componentParams
    			})).then(() => {
    				params.set(componentParams);
    			});

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    		params.set(undefined);
    	});

    	onDestroy(() => {
    		unsubscribeLoc();
    		popStateChanged && window.removeEventListener('popstate', popStateChanged);
    	});

    	const writable_props = ['routes', 'prefix', 'restoreScrollState'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		writable,
    		derived,
    		tick,
    		getLocation,
    		loc,
    		location,
    		querystring,
    		params,
    		push,
    		pop,
    		replace,
    		link,
    		restoreScroll,
    		updateLink,
    		linkOpts,
    		scrollstateHistoryHandler,
    		onDestroy,
    		createEventDispatcher,
    		afterUpdate,
    		parse,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		popStateChanged,
    		lastLoc,
    		componentObj,
    		unsubscribeLoc
    	});

    	$$self.$inject_state = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ('component' in $$props) $$invalidate(0, component = $$props.component);
    		if ('componentParams' in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ('props' in $$props) $$invalidate(2, props = $$props.props);
    		if ('previousScrollState' in $$props) previousScrollState = $$props.previousScrollState;
    		if ('popStateChanged' in $$props) popStateChanged = $$props.popStateChanged;
    		if ('lastLoc' in $$props) lastLoc = $$props.lastLoc;
    		if ('componentObj' in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			history.scrollRestoration = restoreScrollState ? 'manual' : 'auto';
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Components/Carrousel.svelte generated by Svelte v3.59.2 */

    const file$e = "src/Components/Carrousel.svelte";

    function get_each_context$8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    function get_each_context_1$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (8:4) {#each imagenes as imagen, i }
    function create_each_block_1$4(ctx) {
    	let button;
    	let button_data_bs_target_value;

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "data-bs-target", button_data_bs_target_value = "#carouselExample" + /*indice*/ ctx[1]);
    			attr_dev(button, "data-bs-slide-to", /*i*/ ctx[4]);
    			attr_dev(button, "class", "" + (null_to_empty(/*i*/ ctx[4] === 0 ? 'active' : '') + " svelte-154mmy1"));
    			attr_dev(button, "aria-current", "true");
    			attr_dev(button, "aria-label", "Slide " + /*i*/ ctx[4]);
    			add_location(button, file$e, 8, 6, 299);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*indice*/ 2 && button_data_bs_target_value !== (button_data_bs_target_value = "#carouselExample" + /*indice*/ ctx[1])) {
    				attr_dev(button, "data-bs-target", button_data_bs_target_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$4.name,
    		type: "each",
    		source: "(8:4) {#each imagenes as imagen, i }",
    		ctx
    	});

    	return block;
    }

    // (13:4) {#each imagenes as imagen,i}
    function create_each_block$8(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t = space();
    			if (!src_url_equal(img.src, img_src_value = "images/" + /*imagen*/ ctx[2])) attr_dev(img, "src", img_src_value);
    			set_style(img, "height", "400px");
    			attr_dev(img, "class", "d-block w-100");
    			attr_dev(img, "alt", "...");
    			add_location(img, file$e, 14, 8, 624);
    			attr_dev(div, "class", "carousel-item " + (/*i*/ ctx[4] === 0 ? 'active' : ''));
    			add_location(div, file$e, 13, 6, 562);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*imagenes*/ 1 && !src_url_equal(img.src, img_src_value = "images/" + /*imagen*/ ctx[2])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$8.name,
    		type: "each",
    		source: "(13:4) {#each imagenes as imagen,i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let button0;
    	let span0;
    	let t2;
    	let span1;
    	let button0_data_bs_target_value;
    	let t4;
    	let button1;
    	let span2;
    	let t5;
    	let span3;
    	let button1_data_bs_target_value;
    	let div2_id_value;
    	let each_value_1 = /*imagenes*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$4(get_each_context_1$4(ctx, each_value_1, i));
    	}

    	let each_value = /*imagenes*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$8(get_each_context$8(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t0 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			button0 = element("button");
    			span0 = element("span");
    			t2 = space();
    			span1 = element("span");
    			span1.textContent = "Previous";
    			t4 = space();
    			button1 = element("button");
    			span2 = element("span");
    			t5 = space();
    			span3 = element("span");
    			span3.textContent = "Next";
    			attr_dev(div0, "class", "carousel-indicators svelte-154mmy1");
    			add_location(div0, file$e, 6, 2, 224);
    			attr_dev(div1, "class", "carousel-inner");
    			add_location(div1, file$e, 11, 2, 494);
    			attr_dev(span0, "class", "carousel-control-prev-icon svelte-154mmy1");
    			attr_dev(span0, "aria-hidden", "true");
    			add_location(span0, file$e, 24, 4, 886);
    			attr_dev(span1, "class", "visually-hidden");
    			add_location(span1, file$e, 25, 4, 958);
    			attr_dev(button0, "class", "carousel-control-prev");
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "data-bs-target", button0_data_bs_target_value = "#carouselExample" + /*indice*/ ctx[1]);
    			attr_dev(button0, "data-bs-slide", "prev");
    			add_location(button0, file$e, 18, 2, 746);
    			attr_dev(span2, "class", "carousel-control-next-icon svelte-154mmy1");
    			attr_dev(span2, "aria-hidden", "true");
    			add_location(span2, file$e, 33, 4, 1158);
    			attr_dev(span3, "class", "visually-hidden");
    			add_location(span3, file$e, 34, 4, 1230);
    			attr_dev(button1, "class", "carousel-control-next");
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "data-bs-target", button1_data_bs_target_value = "#carouselExample" + /*indice*/ ctx[1]);
    			attr_dev(button1, "data-bs-slide", "next");
    			add_location(button1, file$e, 27, 2, 1018);
    			attr_dev(div2, "id", div2_id_value = "carouselExample" + /*indice*/ ctx[1]);
    			set_style(div2, "height", "400px");
    			set_style(div2, "width", "800px");
    			attr_dev(div2, "class", "carousel slide");
    			add_location(div2, file$e, 5, 0, 127);
    			attr_dev(div3, "class", "container");
    			set_style(div3, "margin-bottom", "100px");
    			add_location(div3, file$e, 4, 0, 73);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(div0, null);
    				}
    			}

    			append_dev(div2, t0);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div1, null);
    				}
    			}

    			append_dev(div2, t1);
    			append_dev(div2, button0);
    			append_dev(button0, span0);
    			append_dev(button0, t2);
    			append_dev(button0, span1);
    			append_dev(div2, t4);
    			append_dev(div2, button1);
    			append_dev(button1, span2);
    			append_dev(button1, t5);
    			append_dev(button1, span3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*indice, imagenes*/ 3) {
    				each_value_1 = /*imagenes*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$4(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$4(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*imagenes*/ 1) {
    				each_value = /*imagenes*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$8(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$8(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*indice*/ 2 && button0_data_bs_target_value !== (button0_data_bs_target_value = "#carouselExample" + /*indice*/ ctx[1])) {
    				attr_dev(button0, "data-bs-target", button0_data_bs_target_value);
    			}

    			if (dirty & /*indice*/ 2 && button1_data_bs_target_value !== (button1_data_bs_target_value = "#carouselExample" + /*indice*/ ctx[1])) {
    				attr_dev(button1, "data-bs-target", button1_data_bs_target_value);
    			}

    			if (dirty & /*indice*/ 2 && div2_id_value !== (div2_id_value = "carouselExample" + /*indice*/ ctx[1])) {
    				attr_dev(div2, "id", div2_id_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Carrousel', slots, []);
    	let { imagenes } = $$props;
    	let { indice } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (imagenes === undefined && !('imagenes' in $$props || $$self.$$.bound[$$self.$$.props['imagenes']])) {
    			console.warn("<Carrousel> was created without expected prop 'imagenes'");
    		}

    		if (indice === undefined && !('indice' in $$props || $$self.$$.bound[$$self.$$.props['indice']])) {
    			console.warn("<Carrousel> was created without expected prop 'indice'");
    		}
    	});

    	const writable_props = ['imagenes', 'indice'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Carrousel> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('imagenes' in $$props) $$invalidate(0, imagenes = $$props.imagenes);
    		if ('indice' in $$props) $$invalidate(1, indice = $$props.indice);
    	};

    	$$self.$capture_state = () => ({ imagenes, indice });

    	$$self.$inject_state = $$props => {
    		if ('imagenes' in $$props) $$invalidate(0, imagenes = $$props.imagenes);
    		if ('indice' in $$props) $$invalidate(1, indice = $$props.indice);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [imagenes, indice];
    }

    class Carrousel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { imagenes: 0, indice: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Carrousel",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get imagenes() {
    		throw new Error("<Carrousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imagenes(value) {
    		throw new Error("<Carrousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get indice() {
    		throw new Error("<Carrousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set indice(value) {
    		throw new Error("<Carrousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function getDefaultExportFromCjs (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    var browser = {};

    // can-promise has a crash in some versions of react native that dont have
    // standard global objects
    // https://github.com/soldair/node-qrcode/issues/157

    var canPromise$1 = function () {
      return typeof Promise === 'function' && Promise.prototype && Promise.prototype.then
    };

    var qrcode = {};

    var utils$1 = {};

    let toSJISFunction;
    const CODEWORDS_COUNT = [
      0, // Not used
      26, 44, 70, 100, 134, 172, 196, 242, 292, 346,
      404, 466, 532, 581, 655, 733, 815, 901, 991, 1085,
      1156, 1258, 1364, 1474, 1588, 1706, 1828, 1921, 2051, 2185,
      2323, 2465, 2611, 2761, 2876, 3034, 3196, 3362, 3532, 3706
    ];

    /**
     * Returns the QR Code size for the specified version
     *
     * @param  {Number} version QR Code version
     * @return {Number}         size of QR code
     */
    utils$1.getSymbolSize = function getSymbolSize (version) {
      if (!version) throw new Error('"version" cannot be null or undefined')
      if (version < 1 || version > 40) throw new Error('"version" should be in range from 1 to 40')
      return version * 4 + 17
    };

    /**
     * Returns the total number of codewords used to store data and EC information.
     *
     * @param  {Number} version QR Code version
     * @return {Number}         Data length in bits
     */
    utils$1.getSymbolTotalCodewords = function getSymbolTotalCodewords (version) {
      return CODEWORDS_COUNT[version]
    };

    /**
     * Encode data with Bose-Chaudhuri-Hocquenghem
     *
     * @param  {Number} data Value to encode
     * @return {Number}      Encoded value
     */
    utils$1.getBCHDigit = function (data) {
      let digit = 0;

      while (data !== 0) {
        digit++;
        data >>>= 1;
      }

      return digit
    };

    utils$1.setToSJISFunction = function setToSJISFunction (f) {
      if (typeof f !== 'function') {
        throw new Error('"toSJISFunc" is not a valid function.')
      }

      toSJISFunction = f;
    };

    utils$1.isKanjiModeEnabled = function () {
      return typeof toSJISFunction !== 'undefined'
    };

    utils$1.toSJIS = function toSJIS (kanji) {
      return toSJISFunction(kanji)
    };

    var errorCorrectionLevel = {};

    (function (exports) {
    	exports.L = { bit: 1 };
    	exports.M = { bit: 0 };
    	exports.Q = { bit: 3 };
    	exports.H = { bit: 2 };

    	function fromString (string) {
    	  if (typeof string !== 'string') {
    	    throw new Error('Param is not a string')
    	  }

    	  const lcStr = string.toLowerCase();

    	  switch (lcStr) {
    	    case 'l':
    	    case 'low':
    	      return exports.L

    	    case 'm':
    	    case 'medium':
    	      return exports.M

    	    case 'q':
    	    case 'quartile':
    	      return exports.Q

    	    case 'h':
    	    case 'high':
    	      return exports.H

    	    default:
    	      throw new Error('Unknown EC Level: ' + string)
    	  }
    	}

    	exports.isValid = function isValid (level) {
    	  return level && typeof level.bit !== 'undefined' &&
    	    level.bit >= 0 && level.bit < 4
    	};

    	exports.from = function from (value, defaultValue) {
    	  if (exports.isValid(value)) {
    	    return value
    	  }

    	  try {
    	    return fromString(value)
    	  } catch (e) {
    	    return defaultValue
    	  }
    	}; 
    } (errorCorrectionLevel));

    function BitBuffer$1 () {
      this.buffer = [];
      this.length = 0;
    }

    BitBuffer$1.prototype = {

      get: function (index) {
        const bufIndex = Math.floor(index / 8);
        return ((this.buffer[bufIndex] >>> (7 - index % 8)) & 1) === 1
      },

      put: function (num, length) {
        for (let i = 0; i < length; i++) {
          this.putBit(((num >>> (length - i - 1)) & 1) === 1);
        }
      },

      getLengthInBits: function () {
        return this.length
      },

      putBit: function (bit) {
        const bufIndex = Math.floor(this.length / 8);
        if (this.buffer.length <= bufIndex) {
          this.buffer.push(0);
        }

        if (bit) {
          this.buffer[bufIndex] |= (0x80 >>> (this.length % 8));
        }

        this.length++;
      }
    };

    var bitBuffer = BitBuffer$1;

    /**
     * Helper class to handle QR Code symbol modules
     *
     * @param {Number} size Symbol size
     */

    function BitMatrix$1 (size) {
      if (!size || size < 1) {
        throw new Error('BitMatrix size must be defined and greater than 0')
      }

      this.size = size;
      this.data = new Uint8Array(size * size);
      this.reservedBit = new Uint8Array(size * size);
    }

    /**
     * Set bit value at specified location
     * If reserved flag is set, this bit will be ignored during masking process
     *
     * @param {Number}  row
     * @param {Number}  col
     * @param {Boolean} value
     * @param {Boolean} reserved
     */
    BitMatrix$1.prototype.set = function (row, col, value, reserved) {
      const index = row * this.size + col;
      this.data[index] = value;
      if (reserved) this.reservedBit[index] = true;
    };

    /**
     * Returns bit value at specified location
     *
     * @param  {Number}  row
     * @param  {Number}  col
     * @return {Boolean}
     */
    BitMatrix$1.prototype.get = function (row, col) {
      return this.data[row * this.size + col]
    };

    /**
     * Applies xor operator at specified location
     * (used during masking process)
     *
     * @param {Number}  row
     * @param {Number}  col
     * @param {Boolean} value
     */
    BitMatrix$1.prototype.xor = function (row, col, value) {
      this.data[row * this.size + col] ^= value;
    };

    /**
     * Check if bit at specified location is reserved
     *
     * @param {Number}   row
     * @param {Number}   col
     * @return {Boolean}
     */
    BitMatrix$1.prototype.isReserved = function (row, col) {
      return this.reservedBit[row * this.size + col]
    };

    var bitMatrix = BitMatrix$1;

    var alignmentPattern = {};

    /**
     * Alignment pattern are fixed reference pattern in defined positions
     * in a matrix symbology, which enables the decode software to re-synchronise
     * the coordinate mapping of the image modules in the event of moderate amounts
     * of distortion of the image.
     *
     * Alignment patterns are present only in QR Code symbols of version 2 or larger
     * and their number depends on the symbol version.
     */

    (function (exports) {
    	const getSymbolSize = utils$1.getSymbolSize;

    	/**
    	 * Calculate the row/column coordinates of the center module of each alignment pattern
    	 * for the specified QR Code version.
    	 *
    	 * The alignment patterns are positioned symmetrically on either side of the diagonal
    	 * running from the top left corner of the symbol to the bottom right corner.
    	 *
    	 * Since positions are simmetrical only half of the coordinates are returned.
    	 * Each item of the array will represent in turn the x and y coordinate.
    	 * @see {@link getPositions}
    	 *
    	 * @param  {Number} version QR Code version
    	 * @return {Array}          Array of coordinate
    	 */
    	exports.getRowColCoords = function getRowColCoords (version) {
    	  if (version === 1) return []

    	  const posCount = Math.floor(version / 7) + 2;
    	  const size = getSymbolSize(version);
    	  const intervals = size === 145 ? 26 : Math.ceil((size - 13) / (2 * posCount - 2)) * 2;
    	  const positions = [size - 7]; // Last coord is always (size - 7)

    	  for (let i = 1; i < posCount - 1; i++) {
    	    positions[i] = positions[i - 1] - intervals;
    	  }

    	  positions.push(6); // First coord is always 6

    	  return positions.reverse()
    	};

    	/**
    	 * Returns an array containing the positions of each alignment pattern.
    	 * Each array's element represent the center point of the pattern as (x, y) coordinates
    	 *
    	 * Coordinates are calculated expanding the row/column coordinates returned by {@link getRowColCoords}
    	 * and filtering out the items that overlaps with finder pattern
    	 *
    	 * @example
    	 * For a Version 7 symbol {@link getRowColCoords} returns values 6, 22 and 38.
    	 * The alignment patterns, therefore, are to be centered on (row, column)
    	 * positions (6,22), (22,6), (22,22), (22,38), (38,22), (38,38).
    	 * Note that the coordinates (6,6), (6,38), (38,6) are occupied by finder patterns
    	 * and are not therefore used for alignment patterns.
    	 *
    	 * let pos = getPositions(7)
    	 * // [[6,22], [22,6], [22,22], [22,38], [38,22], [38,38]]
    	 *
    	 * @param  {Number} version QR Code version
    	 * @return {Array}          Array of coordinates
    	 */
    	exports.getPositions = function getPositions (version) {
    	  const coords = [];
    	  const pos = exports.getRowColCoords(version);
    	  const posLength = pos.length;

    	  for (let i = 0; i < posLength; i++) {
    	    for (let j = 0; j < posLength; j++) {
    	      // Skip if position is occupied by finder patterns
    	      if ((i === 0 && j === 0) || // top-left
    	          (i === 0 && j === posLength - 1) || // bottom-left
    	          (i === posLength - 1 && j === 0)) { // top-right
    	        continue
    	      }

    	      coords.push([pos[i], pos[j]]);
    	    }
    	  }

    	  return coords
    	}; 
    } (alignmentPattern));

    var finderPattern = {};

    const getSymbolSize = utils$1.getSymbolSize;
    const FINDER_PATTERN_SIZE = 7;

    /**
     * Returns an array containing the positions of each finder pattern.
     * Each array's element represent the top-left point of the pattern as (x, y) coordinates
     *
     * @param  {Number} version QR Code version
     * @return {Array}          Array of coordinates
     */
    finderPattern.getPositions = function getPositions (version) {
      const size = getSymbolSize(version);

      return [
        // top-left
        [0, 0],
        // top-right
        [size - FINDER_PATTERN_SIZE, 0],
        // bottom-left
        [0, size - FINDER_PATTERN_SIZE]
      ]
    };

    var maskPattern = {};

    /**
     * Data mask pattern reference
     * @type {Object}
     */

    (function (exports) {
    	exports.Patterns = {
    	  PATTERN000: 0,
    	  PATTERN001: 1,
    	  PATTERN010: 2,
    	  PATTERN011: 3,
    	  PATTERN100: 4,
    	  PATTERN101: 5,
    	  PATTERN110: 6,
    	  PATTERN111: 7
    	};

    	/**
    	 * Weighted penalty scores for the undesirable features
    	 * @type {Object}
    	 */
    	const PenaltyScores = {
    	  N1: 3,
    	  N2: 3,
    	  N3: 40,
    	  N4: 10
    	};

    	/**
    	 * Check if mask pattern value is valid
    	 *
    	 * @param  {Number}  mask    Mask pattern
    	 * @return {Boolean}         true if valid, false otherwise
    	 */
    	exports.isValid = function isValid (mask) {
    	  return mask != null && mask !== '' && !isNaN(mask) && mask >= 0 && mask <= 7
    	};

    	/**
    	 * Returns mask pattern from a value.
    	 * If value is not valid, returns undefined
    	 *
    	 * @param  {Number|String} value        Mask pattern value
    	 * @return {Number}                     Valid mask pattern or undefined
    	 */
    	exports.from = function from (value) {
    	  return exports.isValid(value) ? parseInt(value, 10) : undefined
    	};

    	/**
    	* Find adjacent modules in row/column with the same color
    	* and assign a penalty value.
    	*
    	* Points: N1 + i
    	* i is the amount by which the number of adjacent modules of the same color exceeds 5
    	*/
    	exports.getPenaltyN1 = function getPenaltyN1 (data) {
    	  const size = data.size;
    	  let points = 0;
    	  let sameCountCol = 0;
    	  let sameCountRow = 0;
    	  let lastCol = null;
    	  let lastRow = null;

    	  for (let row = 0; row < size; row++) {
    	    sameCountCol = sameCountRow = 0;
    	    lastCol = lastRow = null;

    	    for (let col = 0; col < size; col++) {
    	      let module = data.get(row, col);
    	      if (module === lastCol) {
    	        sameCountCol++;
    	      } else {
    	        if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
    	        lastCol = module;
    	        sameCountCol = 1;
    	      }

    	      module = data.get(col, row);
    	      if (module === lastRow) {
    	        sameCountRow++;
    	      } else {
    	        if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
    	        lastRow = module;
    	        sameCountRow = 1;
    	      }
    	    }

    	    if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
    	    if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
    	  }

    	  return points
    	};

    	/**
    	 * Find 2x2 blocks with the same color and assign a penalty value
    	 *
    	 * Points: N2 * (m - 1) * (n - 1)
    	 */
    	exports.getPenaltyN2 = function getPenaltyN2 (data) {
    	  const size = data.size;
    	  let points = 0;

    	  for (let row = 0; row < size - 1; row++) {
    	    for (let col = 0; col < size - 1; col++) {
    	      const last = data.get(row, col) +
    	        data.get(row, col + 1) +
    	        data.get(row + 1, col) +
    	        data.get(row + 1, col + 1);

    	      if (last === 4 || last === 0) points++;
    	    }
    	  }

    	  return points * PenaltyScores.N2
    	};

    	/**
    	 * Find 1:1:3:1:1 ratio (dark:light:dark:light:dark) pattern in row/column,
    	 * preceded or followed by light area 4 modules wide
    	 *
    	 * Points: N3 * number of pattern found
    	 */
    	exports.getPenaltyN3 = function getPenaltyN3 (data) {
    	  const size = data.size;
    	  let points = 0;
    	  let bitsCol = 0;
    	  let bitsRow = 0;

    	  for (let row = 0; row < size; row++) {
    	    bitsCol = bitsRow = 0;
    	    for (let col = 0; col < size; col++) {
    	      bitsCol = ((bitsCol << 1) & 0x7FF) | data.get(row, col);
    	      if (col >= 10 && (bitsCol === 0x5D0 || bitsCol === 0x05D)) points++;

    	      bitsRow = ((bitsRow << 1) & 0x7FF) | data.get(col, row);
    	      if (col >= 10 && (bitsRow === 0x5D0 || bitsRow === 0x05D)) points++;
    	    }
    	  }

    	  return points * PenaltyScores.N3
    	};

    	/**
    	 * Calculate proportion of dark modules in entire symbol
    	 *
    	 * Points: N4 * k
    	 *
    	 * k is the rating of the deviation of the proportion of dark modules
    	 * in the symbol from 50% in steps of 5%
    	 */
    	exports.getPenaltyN4 = function getPenaltyN4 (data) {
    	  let darkCount = 0;
    	  const modulesCount = data.data.length;

    	  for (let i = 0; i < modulesCount; i++) darkCount += data.data[i];

    	  const k = Math.abs(Math.ceil((darkCount * 100 / modulesCount) / 5) - 10);

    	  return k * PenaltyScores.N4
    	};

    	/**
    	 * Return mask value at given position
    	 *
    	 * @param  {Number} maskPattern Pattern reference value
    	 * @param  {Number} i           Row
    	 * @param  {Number} j           Column
    	 * @return {Boolean}            Mask value
    	 */
    	function getMaskAt (maskPattern, i, j) {
    	  switch (maskPattern) {
    	    case exports.Patterns.PATTERN000: return (i + j) % 2 === 0
    	    case exports.Patterns.PATTERN001: return i % 2 === 0
    	    case exports.Patterns.PATTERN010: return j % 3 === 0
    	    case exports.Patterns.PATTERN011: return (i + j) % 3 === 0
    	    case exports.Patterns.PATTERN100: return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0
    	    case exports.Patterns.PATTERN101: return (i * j) % 2 + (i * j) % 3 === 0
    	    case exports.Patterns.PATTERN110: return ((i * j) % 2 + (i * j) % 3) % 2 === 0
    	    case exports.Patterns.PATTERN111: return ((i * j) % 3 + (i + j) % 2) % 2 === 0

    	    default: throw new Error('bad maskPattern:' + maskPattern)
    	  }
    	}

    	/**
    	 * Apply a mask pattern to a BitMatrix
    	 *
    	 * @param  {Number}    pattern Pattern reference number
    	 * @param  {BitMatrix} data    BitMatrix data
    	 */
    	exports.applyMask = function applyMask (pattern, data) {
    	  const size = data.size;

    	  for (let col = 0; col < size; col++) {
    	    for (let row = 0; row < size; row++) {
    	      if (data.isReserved(row, col)) continue
    	      data.xor(row, col, getMaskAt(pattern, row, col));
    	    }
    	  }
    	};

    	/**
    	 * Returns the best mask pattern for data
    	 *
    	 * @param  {BitMatrix} data
    	 * @return {Number} Mask pattern reference number
    	 */
    	exports.getBestMask = function getBestMask (data, setupFormatFunc) {
    	  const numPatterns = Object.keys(exports.Patterns).length;
    	  let bestPattern = 0;
    	  let lowerPenalty = Infinity;

    	  for (let p = 0; p < numPatterns; p++) {
    	    setupFormatFunc(p);
    	    exports.applyMask(p, data);

    	    // Calculate penalty
    	    const penalty =
    	      exports.getPenaltyN1(data) +
    	      exports.getPenaltyN2(data) +
    	      exports.getPenaltyN3(data) +
    	      exports.getPenaltyN4(data);

    	    // Undo previously applied mask
    	    exports.applyMask(p, data);

    	    if (penalty < lowerPenalty) {
    	      lowerPenalty = penalty;
    	      bestPattern = p;
    	    }
    	  }

    	  return bestPattern
    	}; 
    } (maskPattern));

    var errorCorrectionCode = {};

    const ECLevel$1 = errorCorrectionLevel;

    const EC_BLOCKS_TABLE = [
    // L  M  Q  H
      1, 1, 1, 1,
      1, 1, 1, 1,
      1, 1, 2, 2,
      1, 2, 2, 4,
      1, 2, 4, 4,
      2, 4, 4, 4,
      2, 4, 6, 5,
      2, 4, 6, 6,
      2, 5, 8, 8,
      4, 5, 8, 8,
      4, 5, 8, 11,
      4, 8, 10, 11,
      4, 9, 12, 16,
      4, 9, 16, 16,
      6, 10, 12, 18,
      6, 10, 17, 16,
      6, 11, 16, 19,
      6, 13, 18, 21,
      7, 14, 21, 25,
      8, 16, 20, 25,
      8, 17, 23, 25,
      9, 17, 23, 34,
      9, 18, 25, 30,
      10, 20, 27, 32,
      12, 21, 29, 35,
      12, 23, 34, 37,
      12, 25, 34, 40,
      13, 26, 35, 42,
      14, 28, 38, 45,
      15, 29, 40, 48,
      16, 31, 43, 51,
      17, 33, 45, 54,
      18, 35, 48, 57,
      19, 37, 51, 60,
      19, 38, 53, 63,
      20, 40, 56, 66,
      21, 43, 59, 70,
      22, 45, 62, 74,
      24, 47, 65, 77,
      25, 49, 68, 81
    ];

    const EC_CODEWORDS_TABLE = [
    // L  M  Q  H
      7, 10, 13, 17,
      10, 16, 22, 28,
      15, 26, 36, 44,
      20, 36, 52, 64,
      26, 48, 72, 88,
      36, 64, 96, 112,
      40, 72, 108, 130,
      48, 88, 132, 156,
      60, 110, 160, 192,
      72, 130, 192, 224,
      80, 150, 224, 264,
      96, 176, 260, 308,
      104, 198, 288, 352,
      120, 216, 320, 384,
      132, 240, 360, 432,
      144, 280, 408, 480,
      168, 308, 448, 532,
      180, 338, 504, 588,
      196, 364, 546, 650,
      224, 416, 600, 700,
      224, 442, 644, 750,
      252, 476, 690, 816,
      270, 504, 750, 900,
      300, 560, 810, 960,
      312, 588, 870, 1050,
      336, 644, 952, 1110,
      360, 700, 1020, 1200,
      390, 728, 1050, 1260,
      420, 784, 1140, 1350,
      450, 812, 1200, 1440,
      480, 868, 1290, 1530,
      510, 924, 1350, 1620,
      540, 980, 1440, 1710,
      570, 1036, 1530, 1800,
      570, 1064, 1590, 1890,
      600, 1120, 1680, 1980,
      630, 1204, 1770, 2100,
      660, 1260, 1860, 2220,
      720, 1316, 1950, 2310,
      750, 1372, 2040, 2430
    ];

    /**
     * Returns the number of error correction block that the QR Code should contain
     * for the specified version and error correction level.
     *
     * @param  {Number} version              QR Code version
     * @param  {Number} errorCorrectionLevel Error correction level
     * @return {Number}                      Number of error correction blocks
     */
    errorCorrectionCode.getBlocksCount = function getBlocksCount (version, errorCorrectionLevel) {
      switch (errorCorrectionLevel) {
        case ECLevel$1.L:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 0]
        case ECLevel$1.M:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 1]
        case ECLevel$1.Q:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 2]
        case ECLevel$1.H:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 3]
        default:
          return undefined
      }
    };

    /**
     * Returns the number of error correction codewords to use for the specified
     * version and error correction level.
     *
     * @param  {Number} version              QR Code version
     * @param  {Number} errorCorrectionLevel Error correction level
     * @return {Number}                      Number of error correction codewords
     */
    errorCorrectionCode.getTotalCodewordsCount = function getTotalCodewordsCount (version, errorCorrectionLevel) {
      switch (errorCorrectionLevel) {
        case ECLevel$1.L:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 0]
        case ECLevel$1.M:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 1]
        case ECLevel$1.Q:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 2]
        case ECLevel$1.H:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 3]
        default:
          return undefined
      }
    };

    var polynomial = {};

    var galoisField = {};

    const EXP_TABLE = new Uint8Array(512);
    const LOG_TABLE = new Uint8Array(256)
    /**
     * Precompute the log and anti-log tables for faster computation later
     *
     * For each possible value in the galois field 2^8, we will pre-compute
     * the logarithm and anti-logarithm (exponential) of this value
     *
     * ref {@link https://en.wikiversity.org/wiki/Reed%E2%80%93Solomon_codes_for_coders#Introduction_to_mathematical_fields}
     */
    ;(function initTables () {
      let x = 1;
      for (let i = 0; i < 255; i++) {
        EXP_TABLE[i] = x;
        LOG_TABLE[x] = i;

        x <<= 1; // multiply by 2

        // The QR code specification says to use byte-wise modulo 100011101 arithmetic.
        // This means that when a number is 256 or larger, it should be XORed with 0x11D.
        if (x & 0x100) { // similar to x >= 256, but a lot faster (because 0x100 == 256)
          x ^= 0x11D;
        }
      }

      // Optimization: double the size of the anti-log table so that we don't need to mod 255 to
      // stay inside the bounds (because we will mainly use this table for the multiplication of
      // two GF numbers, no more).
      // @see {@link mul}
      for (let i = 255; i < 512; i++) {
        EXP_TABLE[i] = EXP_TABLE[i - 255];
      }
    }());

    /**
     * Returns log value of n inside Galois Field
     *
     * @param  {Number} n
     * @return {Number}
     */
    galoisField.log = function log (n) {
      if (n < 1) throw new Error('log(' + n + ')')
      return LOG_TABLE[n]
    };

    /**
     * Returns anti-log value of n inside Galois Field
     *
     * @param  {Number} n
     * @return {Number}
     */
    galoisField.exp = function exp (n) {
      return EXP_TABLE[n]
    };

    /**
     * Multiplies two number inside Galois Field
     *
     * @param  {Number} x
     * @param  {Number} y
     * @return {Number}
     */
    galoisField.mul = function mul (x, y) {
      if (x === 0 || y === 0) return 0

      // should be EXP_TABLE[(LOG_TABLE[x] + LOG_TABLE[y]) % 255] if EXP_TABLE wasn't oversized
      // @see {@link initTables}
      return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]]
    };

    (function (exports) {
    	const GF = galoisField;

    	/**
    	 * Multiplies two polynomials inside Galois Field
    	 *
    	 * @param  {Uint8Array} p1 Polynomial
    	 * @param  {Uint8Array} p2 Polynomial
    	 * @return {Uint8Array}    Product of p1 and p2
    	 */
    	exports.mul = function mul (p1, p2) {
    	  const coeff = new Uint8Array(p1.length + p2.length - 1);

    	  for (let i = 0; i < p1.length; i++) {
    	    for (let j = 0; j < p2.length; j++) {
    	      coeff[i + j] ^= GF.mul(p1[i], p2[j]);
    	    }
    	  }

    	  return coeff
    	};

    	/**
    	 * Calculate the remainder of polynomials division
    	 *
    	 * @param  {Uint8Array} divident Polynomial
    	 * @param  {Uint8Array} divisor  Polynomial
    	 * @return {Uint8Array}          Remainder
    	 */
    	exports.mod = function mod (divident, divisor) {
    	  let result = new Uint8Array(divident);

    	  while ((result.length - divisor.length) >= 0) {
    	    const coeff = result[0];

    	    for (let i = 0; i < divisor.length; i++) {
    	      result[i] ^= GF.mul(divisor[i], coeff);
    	    }

    	    // remove all zeros from buffer head
    	    let offset = 0;
    	    while (offset < result.length && result[offset] === 0) offset++;
    	    result = result.slice(offset);
    	  }

    	  return result
    	};

    	/**
    	 * Generate an irreducible generator polynomial of specified degree
    	 * (used by Reed-Solomon encoder)
    	 *
    	 * @param  {Number} degree Degree of the generator polynomial
    	 * @return {Uint8Array}    Buffer containing polynomial coefficients
    	 */
    	exports.generateECPolynomial = function generateECPolynomial (degree) {
    	  let poly = new Uint8Array([1]);
    	  for (let i = 0; i < degree; i++) {
    	    poly = exports.mul(poly, new Uint8Array([1, GF.exp(i)]));
    	  }

    	  return poly
    	}; 
    } (polynomial));

    const Polynomial = polynomial;

    function ReedSolomonEncoder$1 (degree) {
      this.genPoly = undefined;
      this.degree = degree;

      if (this.degree) this.initialize(this.degree);
    }

    /**
     * Initialize the encoder.
     * The input param should correspond to the number of error correction codewords.
     *
     * @param  {Number} degree
     */
    ReedSolomonEncoder$1.prototype.initialize = function initialize (degree) {
      // create an irreducible generator polynomial
      this.degree = degree;
      this.genPoly = Polynomial.generateECPolynomial(this.degree);
    };

    /**
     * Encodes a chunk of data
     *
     * @param  {Uint8Array} data Buffer containing input data
     * @return {Uint8Array}      Buffer containing encoded data
     */
    ReedSolomonEncoder$1.prototype.encode = function encode (data) {
      if (!this.genPoly) {
        throw new Error('Encoder not initialized')
      }

      // Calculate EC for this data block
      // extends data size to data+genPoly size
      const paddedData = new Uint8Array(data.length + this.degree);
      paddedData.set(data);

      // The error correction codewords are the remainder after dividing the data codewords
      // by a generator polynomial
      const remainder = Polynomial.mod(paddedData, this.genPoly);

      // return EC data blocks (last n byte, where n is the degree of genPoly)
      // If coefficients number in remainder are less than genPoly degree,
      // pad with 0s to the left to reach the needed number of coefficients
      const start = this.degree - remainder.length;
      if (start > 0) {
        const buff = new Uint8Array(this.degree);
        buff.set(remainder, start);

        return buff
      }

      return remainder
    };

    var reedSolomonEncoder = ReedSolomonEncoder$1;

    var version = {};

    var mode = {};

    var versionCheck = {};

    /**
     * Check if QR Code version is valid
     *
     * @param  {Number}  version QR Code version
     * @return {Boolean}         true if valid version, false otherwise
     */

    versionCheck.isValid = function isValid (version) {
      return !isNaN(version) && version >= 1 && version <= 40
    };

    var regex = {};

    const numeric = '[0-9]+';
    const alphanumeric = '[A-Z $%*+\\-./:]+';
    let kanji = '(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|' +
      '[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|' +
      '[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|' +
      '[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+';
    kanji = kanji.replace(/u/g, '\\u');

    const byte = '(?:(?![A-Z0-9 $%*+\\-./:]|' + kanji + ')(?:.|[\r\n]))+';

    regex.KANJI = new RegExp(kanji, 'g');
    regex.BYTE_KANJI = new RegExp('[^A-Z0-9 $%*+\\-./:]+', 'g');
    regex.BYTE = new RegExp(byte, 'g');
    regex.NUMERIC = new RegExp(numeric, 'g');
    regex.ALPHANUMERIC = new RegExp(alphanumeric, 'g');

    const TEST_KANJI = new RegExp('^' + kanji + '$');
    const TEST_NUMERIC = new RegExp('^' + numeric + '$');
    const TEST_ALPHANUMERIC = new RegExp('^[A-Z0-9 $%*+\\-./:]+$');

    regex.testKanji = function testKanji (str) {
      return TEST_KANJI.test(str)
    };

    regex.testNumeric = function testNumeric (str) {
      return TEST_NUMERIC.test(str)
    };

    regex.testAlphanumeric = function testAlphanumeric (str) {
      return TEST_ALPHANUMERIC.test(str)
    };

    (function (exports) {
    	const VersionCheck = versionCheck;
    	const Regex = regex;

    	/**
    	 * Numeric mode encodes data from the decimal digit set (0 - 9)
    	 * (byte values 30HEX to 39HEX).
    	 * Normally, 3 data characters are represented by 10 bits.
    	 *
    	 * @type {Object}
    	 */
    	exports.NUMERIC = {
    	  id: 'Numeric',
    	  bit: 1 << 0,
    	  ccBits: [10, 12, 14]
    	};

    	/**
    	 * Alphanumeric mode encodes data from a set of 45 characters,
    	 * i.e. 10 numeric digits (0 - 9),
    	 *      26 alphabetic characters (A - Z),
    	 *   and 9 symbols (SP, $, %, *, +, -, ., /, :).
    	 * Normally, two input characters are represented by 11 bits.
    	 *
    	 * @type {Object}
    	 */
    	exports.ALPHANUMERIC = {
    	  id: 'Alphanumeric',
    	  bit: 1 << 1,
    	  ccBits: [9, 11, 13]
    	};

    	/**
    	 * In byte mode, data is encoded at 8 bits per character.
    	 *
    	 * @type {Object}
    	 */
    	exports.BYTE = {
    	  id: 'Byte',
    	  bit: 1 << 2,
    	  ccBits: [8, 16, 16]
    	};

    	/**
    	 * The Kanji mode efficiently encodes Kanji characters in accordance with
    	 * the Shift JIS system based on JIS X 0208.
    	 * The Shift JIS values are shifted from the JIS X 0208 values.
    	 * JIS X 0208 gives details of the shift coded representation.
    	 * Each two-byte character value is compacted to a 13-bit binary codeword.
    	 *
    	 * @type {Object}
    	 */
    	exports.KANJI = {
    	  id: 'Kanji',
    	  bit: 1 << 3,
    	  ccBits: [8, 10, 12]
    	};

    	/**
    	 * Mixed mode will contain a sequences of data in a combination of any of
    	 * the modes described above
    	 *
    	 * @type {Object}
    	 */
    	exports.MIXED = {
    	  bit: -1
    	};

    	/**
    	 * Returns the number of bits needed to store the data length
    	 * according to QR Code specifications.
    	 *
    	 * @param  {Mode}   mode    Data mode
    	 * @param  {Number} version QR Code version
    	 * @return {Number}         Number of bits
    	 */
    	exports.getCharCountIndicator = function getCharCountIndicator (mode, version) {
    	  if (!mode.ccBits) throw new Error('Invalid mode: ' + mode)

    	  if (!VersionCheck.isValid(version)) {
    	    throw new Error('Invalid version: ' + version)
    	  }

    	  if (version >= 1 && version < 10) return mode.ccBits[0]
    	  else if (version < 27) return mode.ccBits[1]
    	  return mode.ccBits[2]
    	};

    	/**
    	 * Returns the most efficient mode to store the specified data
    	 *
    	 * @param  {String} dataStr Input data string
    	 * @return {Mode}           Best mode
    	 */
    	exports.getBestModeForData = function getBestModeForData (dataStr) {
    	  if (Regex.testNumeric(dataStr)) return exports.NUMERIC
    	  else if (Regex.testAlphanumeric(dataStr)) return exports.ALPHANUMERIC
    	  else if (Regex.testKanji(dataStr)) return exports.KANJI
    	  else return exports.BYTE
    	};

    	/**
    	 * Return mode name as string
    	 *
    	 * @param {Mode} mode Mode object
    	 * @returns {String}  Mode name
    	 */
    	exports.toString = function toString (mode) {
    	  if (mode && mode.id) return mode.id
    	  throw new Error('Invalid mode')
    	};

    	/**
    	 * Check if input param is a valid mode object
    	 *
    	 * @param   {Mode}    mode Mode object
    	 * @returns {Boolean} True if valid mode, false otherwise
    	 */
    	exports.isValid = function isValid (mode) {
    	  return mode && mode.bit && mode.ccBits
    	};

    	/**
    	 * Get mode object from its name
    	 *
    	 * @param   {String} string Mode name
    	 * @returns {Mode}          Mode object
    	 */
    	function fromString (string) {
    	  if (typeof string !== 'string') {
    	    throw new Error('Param is not a string')
    	  }

    	  const lcStr = string.toLowerCase();

    	  switch (lcStr) {
    	    case 'numeric':
    	      return exports.NUMERIC
    	    case 'alphanumeric':
    	      return exports.ALPHANUMERIC
    	    case 'kanji':
    	      return exports.KANJI
    	    case 'byte':
    	      return exports.BYTE
    	    default:
    	      throw new Error('Unknown mode: ' + string)
    	  }
    	}

    	/**
    	 * Returns mode from a value.
    	 * If value is not a valid mode, returns defaultValue
    	 *
    	 * @param  {Mode|String} value        Encoding mode
    	 * @param  {Mode}        defaultValue Fallback value
    	 * @return {Mode}                     Encoding mode
    	 */
    	exports.from = function from (value, defaultValue) {
    	  if (exports.isValid(value)) {
    	    return value
    	  }

    	  try {
    	    return fromString(value)
    	  } catch (e) {
    	    return defaultValue
    	  }
    	}; 
    } (mode));

    (function (exports) {
    	const Utils = utils$1;
    	const ECCode = errorCorrectionCode;
    	const ECLevel = errorCorrectionLevel;
    	const Mode = mode;
    	const VersionCheck = versionCheck;

    	// Generator polynomial used to encode version information
    	const G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
    	const G18_BCH = Utils.getBCHDigit(G18);

    	function getBestVersionForDataLength (mode, length, errorCorrectionLevel) {
    	  for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
    	    if (length <= exports.getCapacity(currentVersion, errorCorrectionLevel, mode)) {
    	      return currentVersion
    	    }
    	  }

    	  return undefined
    	}

    	function getReservedBitsCount (mode, version) {
    	  // Character count indicator + mode indicator bits
    	  return Mode.getCharCountIndicator(mode, version) + 4
    	}

    	function getTotalBitsFromDataArray (segments, version) {
    	  let totalBits = 0;

    	  segments.forEach(function (data) {
    	    const reservedBits = getReservedBitsCount(data.mode, version);
    	    totalBits += reservedBits + data.getBitsLength();
    	  });

    	  return totalBits
    	}

    	function getBestVersionForMixedData (segments, errorCorrectionLevel) {
    	  for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
    	    const length = getTotalBitsFromDataArray(segments, currentVersion);
    	    if (length <= exports.getCapacity(currentVersion, errorCorrectionLevel, Mode.MIXED)) {
    	      return currentVersion
    	    }
    	  }

    	  return undefined
    	}

    	/**
    	 * Returns version number from a value.
    	 * If value is not a valid version, returns defaultValue
    	 *
    	 * @param  {Number|String} value        QR Code version
    	 * @param  {Number}        defaultValue Fallback value
    	 * @return {Number}                     QR Code version number
    	 */
    	exports.from = function from (value, defaultValue) {
    	  if (VersionCheck.isValid(value)) {
    	    return parseInt(value, 10)
    	  }

    	  return defaultValue
    	};

    	/**
    	 * Returns how much data can be stored with the specified QR code version
    	 * and error correction level
    	 *
    	 * @param  {Number} version              QR Code version (1-40)
    	 * @param  {Number} errorCorrectionLevel Error correction level
    	 * @param  {Mode}   mode                 Data mode
    	 * @return {Number}                      Quantity of storable data
    	 */
    	exports.getCapacity = function getCapacity (version, errorCorrectionLevel, mode) {
    	  if (!VersionCheck.isValid(version)) {
    	    throw new Error('Invalid QR Code version')
    	  }

    	  // Use Byte mode as default
    	  if (typeof mode === 'undefined') mode = Mode.BYTE;

    	  // Total codewords for this QR code version (Data + Error correction)
    	  const totalCodewords = Utils.getSymbolTotalCodewords(version);

    	  // Total number of error correction codewords
    	  const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);

    	  // Total number of data codewords
    	  const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;

    	  if (mode === Mode.MIXED) return dataTotalCodewordsBits

    	  const usableBits = dataTotalCodewordsBits - getReservedBitsCount(mode, version);

    	  // Return max number of storable codewords
    	  switch (mode) {
    	    case Mode.NUMERIC:
    	      return Math.floor((usableBits / 10) * 3)

    	    case Mode.ALPHANUMERIC:
    	      return Math.floor((usableBits / 11) * 2)

    	    case Mode.KANJI:
    	      return Math.floor(usableBits / 13)

    	    case Mode.BYTE:
    	    default:
    	      return Math.floor(usableBits / 8)
    	  }
    	};

    	/**
    	 * Returns the minimum version needed to contain the amount of data
    	 *
    	 * @param  {Segment} data                    Segment of data
    	 * @param  {Number} [errorCorrectionLevel=H] Error correction level
    	 * @param  {Mode} mode                       Data mode
    	 * @return {Number}                          QR Code version
    	 */
    	exports.getBestVersionForData = function getBestVersionForData (data, errorCorrectionLevel) {
    	  let seg;

    	  const ecl = ECLevel.from(errorCorrectionLevel, ECLevel.M);

    	  if (Array.isArray(data)) {
    	    if (data.length > 1) {
    	      return getBestVersionForMixedData(data, ecl)
    	    }

    	    if (data.length === 0) {
    	      return 1
    	    }

    	    seg = data[0];
    	  } else {
    	    seg = data;
    	  }

    	  return getBestVersionForDataLength(seg.mode, seg.getLength(), ecl)
    	};

    	/**
    	 * Returns version information with relative error correction bits
    	 *
    	 * The version information is included in QR Code symbols of version 7 or larger.
    	 * It consists of an 18-bit sequence containing 6 data bits,
    	 * with 12 error correction bits calculated using the (18, 6) Golay code.
    	 *
    	 * @param  {Number} version QR Code version
    	 * @return {Number}         Encoded version info bits
    	 */
    	exports.getEncodedBits = function getEncodedBits (version) {
    	  if (!VersionCheck.isValid(version) || version < 7) {
    	    throw new Error('Invalid QR Code version')
    	  }

    	  let d = version << 12;

    	  while (Utils.getBCHDigit(d) - G18_BCH >= 0) {
    	    d ^= (G18 << (Utils.getBCHDigit(d) - G18_BCH));
    	  }

    	  return (version << 12) | d
    	}; 
    } (version));

    var formatInfo = {};

    const Utils$3 = utils$1;

    const G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
    const G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);
    const G15_BCH = Utils$3.getBCHDigit(G15);

    /**
     * Returns format information with relative error correction bits
     *
     * The format information is a 15-bit sequence containing 5 data bits,
     * with 10 error correction bits calculated using the (15, 5) BCH code.
     *
     * @param  {Number} errorCorrectionLevel Error correction level
     * @param  {Number} mask                 Mask pattern
     * @return {Number}                      Encoded format information bits
     */
    formatInfo.getEncodedBits = function getEncodedBits (errorCorrectionLevel, mask) {
      const data = ((errorCorrectionLevel.bit << 3) | mask);
      let d = data << 10;

      while (Utils$3.getBCHDigit(d) - G15_BCH >= 0) {
        d ^= (G15 << (Utils$3.getBCHDigit(d) - G15_BCH));
      }

      // xor final data with mask pattern in order to ensure that
      // no combination of Error Correction Level and data mask pattern
      // will result in an all-zero data string
      return ((data << 10) | d) ^ G15_MASK
    };

    var segments = {};

    const Mode$4 = mode;

    function NumericData (data) {
      this.mode = Mode$4.NUMERIC;
      this.data = data.toString();
    }

    NumericData.getBitsLength = function getBitsLength (length) {
      return 10 * Math.floor(length / 3) + ((length % 3) ? ((length % 3) * 3 + 1) : 0)
    };

    NumericData.prototype.getLength = function getLength () {
      return this.data.length
    };

    NumericData.prototype.getBitsLength = function getBitsLength () {
      return NumericData.getBitsLength(this.data.length)
    };

    NumericData.prototype.write = function write (bitBuffer) {
      let i, group, value;

      // The input data string is divided into groups of three digits,
      // and each group is converted to its 10-bit binary equivalent.
      for (i = 0; i + 3 <= this.data.length; i += 3) {
        group = this.data.substr(i, 3);
        value = parseInt(group, 10);

        bitBuffer.put(value, 10);
      }

      // If the number of input digits is not an exact multiple of three,
      // the final one or two digits are converted to 4 or 7 bits respectively.
      const remainingNum = this.data.length - i;
      if (remainingNum > 0) {
        group = this.data.substr(i);
        value = parseInt(group, 10);

        bitBuffer.put(value, remainingNum * 3 + 1);
      }
    };

    var numericData = NumericData;

    const Mode$3 = mode;

    /**
     * Array of characters available in alphanumeric mode
     *
     * As per QR Code specification, to each character
     * is assigned a value from 0 to 44 which in this case coincides
     * with the array index
     *
     * @type {Array}
     */
    const ALPHA_NUM_CHARS = [
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
      'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
      ' ', '$', '%', '*', '+', '-', '.', '/', ':'
    ];

    function AlphanumericData (data) {
      this.mode = Mode$3.ALPHANUMERIC;
      this.data = data;
    }

    AlphanumericData.getBitsLength = function getBitsLength (length) {
      return 11 * Math.floor(length / 2) + 6 * (length % 2)
    };

    AlphanumericData.prototype.getLength = function getLength () {
      return this.data.length
    };

    AlphanumericData.prototype.getBitsLength = function getBitsLength () {
      return AlphanumericData.getBitsLength(this.data.length)
    };

    AlphanumericData.prototype.write = function write (bitBuffer) {
      let i;

      // Input data characters are divided into groups of two characters
      // and encoded as 11-bit binary codes.
      for (i = 0; i + 2 <= this.data.length; i += 2) {
        // The character value of the first character is multiplied by 45
        let value = ALPHA_NUM_CHARS.indexOf(this.data[i]) * 45;

        // The character value of the second digit is added to the product
        value += ALPHA_NUM_CHARS.indexOf(this.data[i + 1]);

        // The sum is then stored as 11-bit binary number
        bitBuffer.put(value, 11);
      }

      // If the number of input data characters is not a multiple of two,
      // the character value of the final character is encoded as a 6-bit binary number.
      if (this.data.length % 2) {
        bitBuffer.put(ALPHA_NUM_CHARS.indexOf(this.data[i]), 6);
      }
    };

    var alphanumericData = AlphanumericData;

    const Mode$2 = mode;

    function ByteData (data) {
      this.mode = Mode$2.BYTE;
      if (typeof (data) === 'string') {
        this.data = new TextEncoder().encode(data);
      } else {
        this.data = new Uint8Array(data);
      }
    }

    ByteData.getBitsLength = function getBitsLength (length) {
      return length * 8
    };

    ByteData.prototype.getLength = function getLength () {
      return this.data.length
    };

    ByteData.prototype.getBitsLength = function getBitsLength () {
      return ByteData.getBitsLength(this.data.length)
    };

    ByteData.prototype.write = function (bitBuffer) {
      for (let i = 0, l = this.data.length; i < l; i++) {
        bitBuffer.put(this.data[i], 8);
      }
    };

    var byteData = ByteData;

    const Mode$1 = mode;
    const Utils$2 = utils$1;

    function KanjiData (data) {
      this.mode = Mode$1.KANJI;
      this.data = data;
    }

    KanjiData.getBitsLength = function getBitsLength (length) {
      return length * 13
    };

    KanjiData.prototype.getLength = function getLength () {
      return this.data.length
    };

    KanjiData.prototype.getBitsLength = function getBitsLength () {
      return KanjiData.getBitsLength(this.data.length)
    };

    KanjiData.prototype.write = function (bitBuffer) {
      let i;

      // In the Shift JIS system, Kanji characters are represented by a two byte combination.
      // These byte values are shifted from the JIS X 0208 values.
      // JIS X 0208 gives details of the shift coded representation.
      for (i = 0; i < this.data.length; i++) {
        let value = Utils$2.toSJIS(this.data[i]);

        // For characters with Shift JIS values from 0x8140 to 0x9FFC:
        if (value >= 0x8140 && value <= 0x9FFC) {
          // Subtract 0x8140 from Shift JIS value
          value -= 0x8140;

        // For characters with Shift JIS values from 0xE040 to 0xEBBF
        } else if (value >= 0xE040 && value <= 0xEBBF) {
          // Subtract 0xC140 from Shift JIS value
          value -= 0xC140;
        } else {
          throw new Error(
            'Invalid SJIS character: ' + this.data[i] + '\n' +
            'Make sure your charset is UTF-8')
        }

        // Multiply most significant byte of result by 0xC0
        // and add least significant byte to product
        value = (((value >>> 8) & 0xff) * 0xC0) + (value & 0xff);

        // Convert result to a 13-bit binary string
        bitBuffer.put(value, 13);
      }
    };

    var kanjiData = KanjiData;

    var dijkstra = {exports: {}};

    (function (module) {

    	/******************************************************************************
    	 * Created 2008-08-19.
    	 *
    	 * Dijkstra path-finding functions. Adapted from the Dijkstar Python project.
    	 *
    	 * Copyright (C) 2008
    	 *   Wyatt Baldwin <self@wyattbaldwin.com>
    	 *   All rights reserved
    	 *
    	 * Licensed under the MIT license.
    	 *
    	 *   http://www.opensource.org/licenses/mit-license.php
    	 *
    	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    	 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    	 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    	 * THE SOFTWARE.
    	 *****************************************************************************/
    	var dijkstra = {
    	  single_source_shortest_paths: function(graph, s, d) {
    	    // Predecessor map for each node that has been encountered.
    	    // node ID => predecessor node ID
    	    var predecessors = {};

    	    // Costs of shortest paths from s to all nodes encountered.
    	    // node ID => cost
    	    var costs = {};
    	    costs[s] = 0;

    	    // Costs of shortest paths from s to all nodes encountered; differs from
    	    // `costs` in that it provides easy access to the node that currently has
    	    // the known shortest path from s.
    	    // XXX: Do we actually need both `costs` and `open`?
    	    var open = dijkstra.PriorityQueue.make();
    	    open.push(s, 0);

    	    var closest,
    	        u, v,
    	        cost_of_s_to_u,
    	        adjacent_nodes,
    	        cost_of_e,
    	        cost_of_s_to_u_plus_cost_of_e,
    	        cost_of_s_to_v,
    	        first_visit;
    	    while (!open.empty()) {
    	      // In the nodes remaining in graph that have a known cost from s,
    	      // find the node, u, that currently has the shortest path from s.
    	      closest = open.pop();
    	      u = closest.value;
    	      cost_of_s_to_u = closest.cost;

    	      // Get nodes adjacent to u...
    	      adjacent_nodes = graph[u] || {};

    	      // ...and explore the edges that connect u to those nodes, updating
    	      // the cost of the shortest paths to any or all of those nodes as
    	      // necessary. v is the node across the current edge from u.
    	      for (v in adjacent_nodes) {
    	        if (adjacent_nodes.hasOwnProperty(v)) {
    	          // Get the cost of the edge running from u to v.
    	          cost_of_e = adjacent_nodes[v];

    	          // Cost of s to u plus the cost of u to v across e--this is *a*
    	          // cost from s to v that may or may not be less than the current
    	          // known cost to v.
    	          cost_of_s_to_u_plus_cost_of_e = cost_of_s_to_u + cost_of_e;

    	          // If we haven't visited v yet OR if the current known cost from s to
    	          // v is greater than the new cost we just found (cost of s to u plus
    	          // cost of u to v across e), update v's cost in the cost list and
    	          // update v's predecessor in the predecessor list (it's now u).
    	          cost_of_s_to_v = costs[v];
    	          first_visit = (typeof costs[v] === 'undefined');
    	          if (first_visit || cost_of_s_to_v > cost_of_s_to_u_plus_cost_of_e) {
    	            costs[v] = cost_of_s_to_u_plus_cost_of_e;
    	            open.push(v, cost_of_s_to_u_plus_cost_of_e);
    	            predecessors[v] = u;
    	          }
    	        }
    	      }
    	    }

    	    if (typeof d !== 'undefined' && typeof costs[d] === 'undefined') {
    	      var msg = ['Could not find a path from ', s, ' to ', d, '.'].join('');
    	      throw new Error(msg);
    	    }

    	    return predecessors;
    	  },

    	  extract_shortest_path_from_predecessor_list: function(predecessors, d) {
    	    var nodes = [];
    	    var u = d;
    	    while (u) {
    	      nodes.push(u);
    	      predecessors[u];
    	      u = predecessors[u];
    	    }
    	    nodes.reverse();
    	    return nodes;
    	  },

    	  find_path: function(graph, s, d) {
    	    var predecessors = dijkstra.single_source_shortest_paths(graph, s, d);
    	    return dijkstra.extract_shortest_path_from_predecessor_list(
    	      predecessors, d);
    	  },

    	  /**
    	   * A very naive priority queue implementation.
    	   */
    	  PriorityQueue: {
    	    make: function (opts) {
    	      var T = dijkstra.PriorityQueue,
    	          t = {},
    	          key;
    	      opts = opts || {};
    	      for (key in T) {
    	        if (T.hasOwnProperty(key)) {
    	          t[key] = T[key];
    	        }
    	      }
    	      t.queue = [];
    	      t.sorter = opts.sorter || T.default_sorter;
    	      return t;
    	    },

    	    default_sorter: function (a, b) {
    	      return a.cost - b.cost;
    	    },

    	    /**
    	     * Add a new item to the queue and ensure the highest priority element
    	     * is at the front of the queue.
    	     */
    	    push: function (value, cost) {
    	      var item = {value: value, cost: cost};
    	      this.queue.push(item);
    	      this.queue.sort(this.sorter);
    	    },

    	    /**
    	     * Return the highest priority element in the queue.
    	     */
    	    pop: function () {
    	      return this.queue.shift();
    	    },

    	    empty: function () {
    	      return this.queue.length === 0;
    	    }
    	  }
    	};


    	// node.js module exports
    	{
    	  module.exports = dijkstra;
    	} 
    } (dijkstra));

    var dijkstraExports = dijkstra.exports;

    (function (exports) {
    	const Mode = mode;
    	const NumericData = numericData;
    	const AlphanumericData = alphanumericData;
    	const ByteData = byteData;
    	const KanjiData = kanjiData;
    	const Regex = regex;
    	const Utils = utils$1;
    	const dijkstra = dijkstraExports;

    	/**
    	 * Returns UTF8 byte length
    	 *
    	 * @param  {String} str Input string
    	 * @return {Number}     Number of byte
    	 */
    	function getStringByteLength (str) {
    	  return unescape(encodeURIComponent(str)).length
    	}

    	/**
    	 * Get a list of segments of the specified mode
    	 * from a string
    	 *
    	 * @param  {Mode}   mode Segment mode
    	 * @param  {String} str  String to process
    	 * @return {Array}       Array of object with segments data
    	 */
    	function getSegments (regex, mode, str) {
    	  const segments = [];
    	  let result;

    	  while ((result = regex.exec(str)) !== null) {
    	    segments.push({
    	      data: result[0],
    	      index: result.index,
    	      mode: mode,
    	      length: result[0].length
    	    });
    	  }

    	  return segments
    	}

    	/**
    	 * Extracts a series of segments with the appropriate
    	 * modes from a string
    	 *
    	 * @param  {String} dataStr Input string
    	 * @return {Array}          Array of object with segments data
    	 */
    	function getSegmentsFromString (dataStr) {
    	  const numSegs = getSegments(Regex.NUMERIC, Mode.NUMERIC, dataStr);
    	  const alphaNumSegs = getSegments(Regex.ALPHANUMERIC, Mode.ALPHANUMERIC, dataStr);
    	  let byteSegs;
    	  let kanjiSegs;

    	  if (Utils.isKanjiModeEnabled()) {
    	    byteSegs = getSegments(Regex.BYTE, Mode.BYTE, dataStr);
    	    kanjiSegs = getSegments(Regex.KANJI, Mode.KANJI, dataStr);
    	  } else {
    	    byteSegs = getSegments(Regex.BYTE_KANJI, Mode.BYTE, dataStr);
    	    kanjiSegs = [];
    	  }

    	  const segs = numSegs.concat(alphaNumSegs, byteSegs, kanjiSegs);

    	  return segs
    	    .sort(function (s1, s2) {
    	      return s1.index - s2.index
    	    })
    	    .map(function (obj) {
    	      return {
    	        data: obj.data,
    	        mode: obj.mode,
    	        length: obj.length
    	      }
    	    })
    	}

    	/**
    	 * Returns how many bits are needed to encode a string of
    	 * specified length with the specified mode
    	 *
    	 * @param  {Number} length String length
    	 * @param  {Mode} mode     Segment mode
    	 * @return {Number}        Bit length
    	 */
    	function getSegmentBitsLength (length, mode) {
    	  switch (mode) {
    	    case Mode.NUMERIC:
    	      return NumericData.getBitsLength(length)
    	    case Mode.ALPHANUMERIC:
    	      return AlphanumericData.getBitsLength(length)
    	    case Mode.KANJI:
    	      return KanjiData.getBitsLength(length)
    	    case Mode.BYTE:
    	      return ByteData.getBitsLength(length)
    	  }
    	}

    	/**
    	 * Merges adjacent segments which have the same mode
    	 *
    	 * @param  {Array} segs Array of object with segments data
    	 * @return {Array}      Array of object with segments data
    	 */
    	function mergeSegments (segs) {
    	  return segs.reduce(function (acc, curr) {
    	    const prevSeg = acc.length - 1 >= 0 ? acc[acc.length - 1] : null;
    	    if (prevSeg && prevSeg.mode === curr.mode) {
    	      acc[acc.length - 1].data += curr.data;
    	      return acc
    	    }

    	    acc.push(curr);
    	    return acc
    	  }, [])
    	}

    	/**
    	 * Generates a list of all possible nodes combination which
    	 * will be used to build a segments graph.
    	 *
    	 * Nodes are divided by groups. Each group will contain a list of all the modes
    	 * in which is possible to encode the given text.
    	 *
    	 * For example the text '12345' can be encoded as Numeric, Alphanumeric or Byte.
    	 * The group for '12345' will contain then 3 objects, one for each
    	 * possible encoding mode.
    	 *
    	 * Each node represents a possible segment.
    	 *
    	 * @param  {Array} segs Array of object with segments data
    	 * @return {Array}      Array of object with segments data
    	 */
    	function buildNodes (segs) {
    	  const nodes = [];
    	  for (let i = 0; i < segs.length; i++) {
    	    const seg = segs[i];

    	    switch (seg.mode) {
    	      case Mode.NUMERIC:
    	        nodes.push([seg,
    	          { data: seg.data, mode: Mode.ALPHANUMERIC, length: seg.length },
    	          { data: seg.data, mode: Mode.BYTE, length: seg.length }
    	        ]);
    	        break
    	      case Mode.ALPHANUMERIC:
    	        nodes.push([seg,
    	          { data: seg.data, mode: Mode.BYTE, length: seg.length }
    	        ]);
    	        break
    	      case Mode.KANJI:
    	        nodes.push([seg,
    	          { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
    	        ]);
    	        break
    	      case Mode.BYTE:
    	        nodes.push([
    	          { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
    	        ]);
    	    }
    	  }

    	  return nodes
    	}

    	/**
    	 * Builds a graph from a list of nodes.
    	 * All segments in each node group will be connected with all the segments of
    	 * the next group and so on.
    	 *
    	 * At each connection will be assigned a weight depending on the
    	 * segment's byte length.
    	 *
    	 * @param  {Array} nodes    Array of object with segments data
    	 * @param  {Number} version QR Code version
    	 * @return {Object}         Graph of all possible segments
    	 */
    	function buildGraph (nodes, version) {
    	  const table = {};
    	  const graph = { start: {} };
    	  let prevNodeIds = ['start'];

    	  for (let i = 0; i < nodes.length; i++) {
    	    const nodeGroup = nodes[i];
    	    const currentNodeIds = [];

    	    for (let j = 0; j < nodeGroup.length; j++) {
    	      const node = nodeGroup[j];
    	      const key = '' + i + j;

    	      currentNodeIds.push(key);
    	      table[key] = { node: node, lastCount: 0 };
    	      graph[key] = {};

    	      for (let n = 0; n < prevNodeIds.length; n++) {
    	        const prevNodeId = prevNodeIds[n];

    	        if (table[prevNodeId] && table[prevNodeId].node.mode === node.mode) {
    	          graph[prevNodeId][key] =
    	            getSegmentBitsLength(table[prevNodeId].lastCount + node.length, node.mode) -
    	            getSegmentBitsLength(table[prevNodeId].lastCount, node.mode);

    	          table[prevNodeId].lastCount += node.length;
    	        } else {
    	          if (table[prevNodeId]) table[prevNodeId].lastCount = node.length;

    	          graph[prevNodeId][key] = getSegmentBitsLength(node.length, node.mode) +
    	            4 + Mode.getCharCountIndicator(node.mode, version); // switch cost
    	        }
    	      }
    	    }

    	    prevNodeIds = currentNodeIds;
    	  }

    	  for (let n = 0; n < prevNodeIds.length; n++) {
    	    graph[prevNodeIds[n]].end = 0;
    	  }

    	  return { map: graph, table: table }
    	}

    	/**
    	 * Builds a segment from a specified data and mode.
    	 * If a mode is not specified, the more suitable will be used.
    	 *
    	 * @param  {String} data             Input data
    	 * @param  {Mode | String} modesHint Data mode
    	 * @return {Segment}                 Segment
    	 */
    	function buildSingleSegment (data, modesHint) {
    	  let mode;
    	  const bestMode = Mode.getBestModeForData(data);

    	  mode = Mode.from(modesHint, bestMode);

    	  // Make sure data can be encoded
    	  if (mode !== Mode.BYTE && mode.bit < bestMode.bit) {
    	    throw new Error('"' + data + '"' +
    	      ' cannot be encoded with mode ' + Mode.toString(mode) +
    	      '.\n Suggested mode is: ' + Mode.toString(bestMode))
    	  }

    	  // Use Mode.BYTE if Kanji support is disabled
    	  if (mode === Mode.KANJI && !Utils.isKanjiModeEnabled()) {
    	    mode = Mode.BYTE;
    	  }

    	  switch (mode) {
    	    case Mode.NUMERIC:
    	      return new NumericData(data)

    	    case Mode.ALPHANUMERIC:
    	      return new AlphanumericData(data)

    	    case Mode.KANJI:
    	      return new KanjiData(data)

    	    case Mode.BYTE:
    	      return new ByteData(data)
    	  }
    	}

    	/**
    	 * Builds a list of segments from an array.
    	 * Array can contain Strings or Objects with segment's info.
    	 *
    	 * For each item which is a string, will be generated a segment with the given
    	 * string and the more appropriate encoding mode.
    	 *
    	 * For each item which is an object, will be generated a segment with the given
    	 * data and mode.
    	 * Objects must contain at least the property "data".
    	 * If property "mode" is not present, the more suitable mode will be used.
    	 *
    	 * @param  {Array} array Array of objects with segments data
    	 * @return {Array}       Array of Segments
    	 */
    	exports.fromArray = function fromArray (array) {
    	  return array.reduce(function (acc, seg) {
    	    if (typeof seg === 'string') {
    	      acc.push(buildSingleSegment(seg, null));
    	    } else if (seg.data) {
    	      acc.push(buildSingleSegment(seg.data, seg.mode));
    	    }

    	    return acc
    	  }, [])
    	};

    	/**
    	 * Builds an optimized sequence of segments from a string,
    	 * which will produce the shortest possible bitstream.
    	 *
    	 * @param  {String} data    Input string
    	 * @param  {Number} version QR Code version
    	 * @return {Array}          Array of segments
    	 */
    	exports.fromString = function fromString (data, version) {
    	  const segs = getSegmentsFromString(data, Utils.isKanjiModeEnabled());

    	  const nodes = buildNodes(segs);
    	  const graph = buildGraph(nodes, version);
    	  const path = dijkstra.find_path(graph.map, 'start', 'end');

    	  const optimizedSegs = [];
    	  for (let i = 1; i < path.length - 1; i++) {
    	    optimizedSegs.push(graph.table[path[i]].node);
    	  }

    	  return exports.fromArray(mergeSegments(optimizedSegs))
    	};

    	/**
    	 * Splits a string in various segments with the modes which
    	 * best represent their content.
    	 * The produced segments are far from being optimized.
    	 * The output of this function is only used to estimate a QR Code version
    	 * which may contain the data.
    	 *
    	 * @param  {string} data Input string
    	 * @return {Array}       Array of segments
    	 */
    	exports.rawSplit = function rawSplit (data) {
    	  return exports.fromArray(
    	    getSegmentsFromString(data, Utils.isKanjiModeEnabled())
    	  )
    	}; 
    } (segments));

    const Utils$1 = utils$1;
    const ECLevel = errorCorrectionLevel;
    const BitBuffer = bitBuffer;
    const BitMatrix = bitMatrix;
    const AlignmentPattern = alignmentPattern;
    const FinderPattern = finderPattern;
    const MaskPattern = maskPattern;
    const ECCode = errorCorrectionCode;
    const ReedSolomonEncoder = reedSolomonEncoder;
    const Version = version;
    const FormatInfo = formatInfo;
    const Mode = mode;
    const Segments = segments;

    /**
     * QRCode for JavaScript
     *
     * modified by Ryan Day for nodejs support
     * Copyright (c) 2011 Ryan Day
     *
     * Licensed under the MIT license:
     *   http://www.opensource.org/licenses/mit-license.php
     *
    //---------------------------------------------------------------------
    // QRCode for JavaScript
    //
    // Copyright (c) 2009 Kazuhiko Arase
    //
    // URL: http://www.d-project.com/
    //
    // Licensed under the MIT license:
    //   http://www.opensource.org/licenses/mit-license.php
    //
    // The word "QR Code" is registered trademark of
    // DENSO WAVE INCORPORATED
    //   http://www.denso-wave.com/qrcode/faqpatent-e.html
    //
    //---------------------------------------------------------------------
    */

    /**
     * Add finder patterns bits to matrix
     *
     * @param  {BitMatrix} matrix  Modules matrix
     * @param  {Number}    version QR Code version
     */
    function setupFinderPattern (matrix, version) {
      const size = matrix.size;
      const pos = FinderPattern.getPositions(version);

      for (let i = 0; i < pos.length; i++) {
        const row = pos[i][0];
        const col = pos[i][1];

        for (let r = -1; r <= 7; r++) {
          if (row + r <= -1 || size <= row + r) continue

          for (let c = -1; c <= 7; c++) {
            if (col + c <= -1 || size <= col + c) continue

            if ((r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
              (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
              (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
              matrix.set(row + r, col + c, true, true);
            } else {
              matrix.set(row + r, col + c, false, true);
            }
          }
        }
      }
    }

    /**
     * Add timing pattern bits to matrix
     *
     * Note: this function must be called before {@link setupAlignmentPattern}
     *
     * @param  {BitMatrix} matrix Modules matrix
     */
    function setupTimingPattern (matrix) {
      const size = matrix.size;

      for (let r = 8; r < size - 8; r++) {
        const value = r % 2 === 0;
        matrix.set(r, 6, value, true);
        matrix.set(6, r, value, true);
      }
    }

    /**
     * Add alignment patterns bits to matrix
     *
     * Note: this function must be called after {@link setupTimingPattern}
     *
     * @param  {BitMatrix} matrix  Modules matrix
     * @param  {Number}    version QR Code version
     */
    function setupAlignmentPattern (matrix, version) {
      const pos = AlignmentPattern.getPositions(version);

      for (let i = 0; i < pos.length; i++) {
        const row = pos[i][0];
        const col = pos[i][1];

        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            if (r === -2 || r === 2 || c === -2 || c === 2 ||
              (r === 0 && c === 0)) {
              matrix.set(row + r, col + c, true, true);
            } else {
              matrix.set(row + r, col + c, false, true);
            }
          }
        }
      }
    }

    /**
     * Add version info bits to matrix
     *
     * @param  {BitMatrix} matrix  Modules matrix
     * @param  {Number}    version QR Code version
     */
    function setupVersionInfo (matrix, version) {
      const size = matrix.size;
      const bits = Version.getEncodedBits(version);
      let row, col, mod;

      for (let i = 0; i < 18; i++) {
        row = Math.floor(i / 3);
        col = i % 3 + size - 8 - 3;
        mod = ((bits >> i) & 1) === 1;

        matrix.set(row, col, mod, true);
        matrix.set(col, row, mod, true);
      }
    }

    /**
     * Add format info bits to matrix
     *
     * @param  {BitMatrix} matrix               Modules matrix
     * @param  {ErrorCorrectionLevel}    errorCorrectionLevel Error correction level
     * @param  {Number}    maskPattern          Mask pattern reference value
     */
    function setupFormatInfo (matrix, errorCorrectionLevel, maskPattern) {
      const size = matrix.size;
      const bits = FormatInfo.getEncodedBits(errorCorrectionLevel, maskPattern);
      let i, mod;

      for (i = 0; i < 15; i++) {
        mod = ((bits >> i) & 1) === 1;

        // vertical
        if (i < 6) {
          matrix.set(i, 8, mod, true);
        } else if (i < 8) {
          matrix.set(i + 1, 8, mod, true);
        } else {
          matrix.set(size - 15 + i, 8, mod, true);
        }

        // horizontal
        if (i < 8) {
          matrix.set(8, size - i - 1, mod, true);
        } else if (i < 9) {
          matrix.set(8, 15 - i - 1 + 1, mod, true);
        } else {
          matrix.set(8, 15 - i - 1, mod, true);
        }
      }

      // fixed module
      matrix.set(size - 8, 8, 1, true);
    }

    /**
     * Add encoded data bits to matrix
     *
     * @param  {BitMatrix}  matrix Modules matrix
     * @param  {Uint8Array} data   Data codewords
     */
    function setupData (matrix, data) {
      const size = matrix.size;
      let inc = -1;
      let row = size - 1;
      let bitIndex = 7;
      let byteIndex = 0;

      for (let col = size - 1; col > 0; col -= 2) {
        if (col === 6) col--;

        while (true) {
          for (let c = 0; c < 2; c++) {
            if (!matrix.isReserved(row, col - c)) {
              let dark = false;

              if (byteIndex < data.length) {
                dark = (((data[byteIndex] >>> bitIndex) & 1) === 1);
              }

              matrix.set(row, col - c, dark);
              bitIndex--;

              if (bitIndex === -1) {
                byteIndex++;
                bitIndex = 7;
              }
            }
          }

          row += inc;

          if (row < 0 || size <= row) {
            row -= inc;
            inc = -inc;
            break
          }
        }
      }
    }

    /**
     * Create encoded codewords from data input
     *
     * @param  {Number}   version              QR Code version
     * @param  {ErrorCorrectionLevel}   errorCorrectionLevel Error correction level
     * @param  {ByteData} data                 Data input
     * @return {Uint8Array}                    Buffer containing encoded codewords
     */
    function createData (version, errorCorrectionLevel, segments) {
      // Prepare data buffer
      const buffer = new BitBuffer();

      segments.forEach(function (data) {
        // prefix data with mode indicator (4 bits)
        buffer.put(data.mode.bit, 4);

        // Prefix data with character count indicator.
        // The character count indicator is a string of bits that represents the
        // number of characters that are being encoded.
        // The character count indicator must be placed after the mode indicator
        // and must be a certain number of bits long, depending on the QR version
        // and data mode
        // @see {@link Mode.getCharCountIndicator}.
        buffer.put(data.getLength(), Mode.getCharCountIndicator(data.mode, version));

        // add binary data sequence to buffer
        data.write(buffer);
      });

      // Calculate required number of bits
      const totalCodewords = Utils$1.getSymbolTotalCodewords(version);
      const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
      const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;

      // Add a terminator.
      // If the bit string is shorter than the total number of required bits,
      // a terminator of up to four 0s must be added to the right side of the string.
      // If the bit string is more than four bits shorter than the required number of bits,
      // add four 0s to the end.
      if (buffer.getLengthInBits() + 4 <= dataTotalCodewordsBits) {
        buffer.put(0, 4);
      }

      // If the bit string is fewer than four bits shorter, add only the number of 0s that
      // are needed to reach the required number of bits.

      // After adding the terminator, if the number of bits in the string is not a multiple of 8,
      // pad the string on the right with 0s to make the string's length a multiple of 8.
      while (buffer.getLengthInBits() % 8 !== 0) {
        buffer.putBit(0);
      }

      // Add pad bytes if the string is still shorter than the total number of required bits.
      // Extend the buffer to fill the data capacity of the symbol corresponding to
      // the Version and Error Correction Level by adding the Pad Codewords 11101100 (0xEC)
      // and 00010001 (0x11) alternately.
      const remainingByte = (dataTotalCodewordsBits - buffer.getLengthInBits()) / 8;
      for (let i = 0; i < remainingByte; i++) {
        buffer.put(i % 2 ? 0x11 : 0xEC, 8);
      }

      return createCodewords(buffer, version, errorCorrectionLevel)
    }

    /**
     * Encode input data with Reed-Solomon and return codewords with
     * relative error correction bits
     *
     * @param  {BitBuffer} bitBuffer            Data to encode
     * @param  {Number}    version              QR Code version
     * @param  {ErrorCorrectionLevel} errorCorrectionLevel Error correction level
     * @return {Uint8Array}                     Buffer containing encoded codewords
     */
    function createCodewords (bitBuffer, version, errorCorrectionLevel) {
      // Total codewords for this QR code version (Data + Error correction)
      const totalCodewords = Utils$1.getSymbolTotalCodewords(version);

      // Total number of error correction codewords
      const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);

      // Total number of data codewords
      const dataTotalCodewords = totalCodewords - ecTotalCodewords;

      // Total number of blocks
      const ecTotalBlocks = ECCode.getBlocksCount(version, errorCorrectionLevel);

      // Calculate how many blocks each group should contain
      const blocksInGroup2 = totalCodewords % ecTotalBlocks;
      const blocksInGroup1 = ecTotalBlocks - blocksInGroup2;

      const totalCodewordsInGroup1 = Math.floor(totalCodewords / ecTotalBlocks);

      const dataCodewordsInGroup1 = Math.floor(dataTotalCodewords / ecTotalBlocks);
      const dataCodewordsInGroup2 = dataCodewordsInGroup1 + 1;

      // Number of EC codewords is the same for both groups
      const ecCount = totalCodewordsInGroup1 - dataCodewordsInGroup1;

      // Initialize a Reed-Solomon encoder with a generator polynomial of degree ecCount
      const rs = new ReedSolomonEncoder(ecCount);

      let offset = 0;
      const dcData = new Array(ecTotalBlocks);
      const ecData = new Array(ecTotalBlocks);
      let maxDataSize = 0;
      const buffer = new Uint8Array(bitBuffer.buffer);

      // Divide the buffer into the required number of blocks
      for (let b = 0; b < ecTotalBlocks; b++) {
        const dataSize = b < blocksInGroup1 ? dataCodewordsInGroup1 : dataCodewordsInGroup2;

        // extract a block of data from buffer
        dcData[b] = buffer.slice(offset, offset + dataSize);

        // Calculate EC codewords for this data block
        ecData[b] = rs.encode(dcData[b]);

        offset += dataSize;
        maxDataSize = Math.max(maxDataSize, dataSize);
      }

      // Create final data
      // Interleave the data and error correction codewords from each block
      const data = new Uint8Array(totalCodewords);
      let index = 0;
      let i, r;

      // Add data codewords
      for (i = 0; i < maxDataSize; i++) {
        for (r = 0; r < ecTotalBlocks; r++) {
          if (i < dcData[r].length) {
            data[index++] = dcData[r][i];
          }
        }
      }

      // Apped EC codewords
      for (i = 0; i < ecCount; i++) {
        for (r = 0; r < ecTotalBlocks; r++) {
          data[index++] = ecData[r][i];
        }
      }

      return data
    }

    /**
     * Build QR Code symbol
     *
     * @param  {String} data                 Input string
     * @param  {Number} version              QR Code version
     * @param  {ErrorCorretionLevel} errorCorrectionLevel Error level
     * @param  {MaskPattern} maskPattern     Mask pattern
     * @return {Object}                      Object containing symbol data
     */
    function createSymbol (data, version, errorCorrectionLevel, maskPattern) {
      let segments;

      if (Array.isArray(data)) {
        segments = Segments.fromArray(data);
      } else if (typeof data === 'string') {
        let estimatedVersion = version;

        if (!estimatedVersion) {
          const rawSegments = Segments.rawSplit(data);

          // Estimate best version that can contain raw splitted segments
          estimatedVersion = Version.getBestVersionForData(rawSegments, errorCorrectionLevel);
        }

        // Build optimized segments
        // If estimated version is undefined, try with the highest version
        segments = Segments.fromString(data, estimatedVersion || 40);
      } else {
        throw new Error('Invalid data')
      }

      // Get the min version that can contain data
      const bestVersion = Version.getBestVersionForData(segments, errorCorrectionLevel);

      // If no version is found, data cannot be stored
      if (!bestVersion) {
        throw new Error('The amount of data is too big to be stored in a QR Code')
      }

      // If not specified, use min version as default
      if (!version) {
        version = bestVersion;

      // Check if the specified version can contain the data
      } else if (version < bestVersion) {
        throw new Error('\n' +
          'The chosen QR Code version cannot contain this amount of data.\n' +
          'Minimum version required to store current data is: ' + bestVersion + '.\n'
        )
      }

      const dataBits = createData(version, errorCorrectionLevel, segments);

      // Allocate matrix buffer
      const moduleCount = Utils$1.getSymbolSize(version);
      const modules = new BitMatrix(moduleCount);

      // Add function modules
      setupFinderPattern(modules, version);
      setupTimingPattern(modules);
      setupAlignmentPattern(modules, version);

      // Add temporary dummy bits for format info just to set them as reserved.
      // This is needed to prevent these bits from being masked by {@link MaskPattern.applyMask}
      // since the masking operation must be performed only on the encoding region.
      // These blocks will be replaced with correct values later in code.
      setupFormatInfo(modules, errorCorrectionLevel, 0);

      if (version >= 7) {
        setupVersionInfo(modules, version);
      }

      // Add data codewords
      setupData(modules, dataBits);

      if (isNaN(maskPattern)) {
        // Find best mask pattern
        maskPattern = MaskPattern.getBestMask(modules,
          setupFormatInfo.bind(null, modules, errorCorrectionLevel));
      }

      // Apply mask pattern
      MaskPattern.applyMask(maskPattern, modules);

      // Replace format info bits with correct values
      setupFormatInfo(modules, errorCorrectionLevel, maskPattern);

      return {
        modules: modules,
        version: version,
        errorCorrectionLevel: errorCorrectionLevel,
        maskPattern: maskPattern,
        segments: segments
      }
    }

    /**
     * QR Code
     *
     * @param {String | Array} data                 Input data
     * @param {Object} options                      Optional configurations
     * @param {Number} options.version              QR Code version
     * @param {String} options.errorCorrectionLevel Error correction level
     * @param {Function} options.toSJISFunc         Helper func to convert utf8 to sjis
     */
    qrcode.create = function create (data, options) {
      if (typeof data === 'undefined' || data === '') {
        throw new Error('No input text')
      }

      let errorCorrectionLevel = ECLevel.M;
      let version;
      let mask;

      if (typeof options !== 'undefined') {
        // Use higher error correction level as default
        errorCorrectionLevel = ECLevel.from(options.errorCorrectionLevel, ECLevel.M);
        version = Version.from(options.version);
        mask = MaskPattern.from(options.maskPattern);

        if (options.toSJISFunc) {
          Utils$1.setToSJISFunction(options.toSJISFunc);
        }
      }

      return createSymbol(data, version, errorCorrectionLevel, mask)
    };

    var canvas = {};

    var utils = {};

    (function (exports) {
    	function hex2rgba (hex) {
    	  if (typeof hex === 'number') {
    	    hex = hex.toString();
    	  }

    	  if (typeof hex !== 'string') {
    	    throw new Error('Color should be defined as hex string')
    	  }

    	  let hexCode = hex.slice().replace('#', '').split('');
    	  if (hexCode.length < 3 || hexCode.length === 5 || hexCode.length > 8) {
    	    throw new Error('Invalid hex color: ' + hex)
    	  }

    	  // Convert from short to long form (fff -> ffffff)
    	  if (hexCode.length === 3 || hexCode.length === 4) {
    	    hexCode = Array.prototype.concat.apply([], hexCode.map(function (c) {
    	      return [c, c]
    	    }));
    	  }

    	  // Add default alpha value
    	  if (hexCode.length === 6) hexCode.push('F', 'F');

    	  const hexValue = parseInt(hexCode.join(''), 16);

    	  return {
    	    r: (hexValue >> 24) & 255,
    	    g: (hexValue >> 16) & 255,
    	    b: (hexValue >> 8) & 255,
    	    a: hexValue & 255,
    	    hex: '#' + hexCode.slice(0, 6).join('')
    	  }
    	}

    	exports.getOptions = function getOptions (options) {
    	  if (!options) options = {};
    	  if (!options.color) options.color = {};

    	  const margin = typeof options.margin === 'undefined' ||
    	    options.margin === null ||
    	    options.margin < 0
    	    ? 4
    	    : options.margin;

    	  const width = options.width && options.width >= 21 ? options.width : undefined;
    	  const scale = options.scale || 4;

    	  return {
    	    width: width,
    	    scale: width ? 4 : scale,
    	    margin: margin,
    	    color: {
    	      dark: hex2rgba(options.color.dark || '#000000ff'),
    	      light: hex2rgba(options.color.light || '#ffffffff')
    	    },
    	    type: options.type,
    	    rendererOpts: options.rendererOpts || {}
    	  }
    	};

    	exports.getScale = function getScale (qrSize, opts) {
    	  return opts.width && opts.width >= qrSize + opts.margin * 2
    	    ? opts.width / (qrSize + opts.margin * 2)
    	    : opts.scale
    	};

    	exports.getImageWidth = function getImageWidth (qrSize, opts) {
    	  const scale = exports.getScale(qrSize, opts);
    	  return Math.floor((qrSize + opts.margin * 2) * scale)
    	};

    	exports.qrToImageData = function qrToImageData (imgData, qr, opts) {
    	  const size = qr.modules.size;
    	  const data = qr.modules.data;
    	  const scale = exports.getScale(size, opts);
    	  const symbolSize = Math.floor((size + opts.margin * 2) * scale);
    	  const scaledMargin = opts.margin * scale;
    	  const palette = [opts.color.light, opts.color.dark];

    	  for (let i = 0; i < symbolSize; i++) {
    	    for (let j = 0; j < symbolSize; j++) {
    	      let posDst = (i * symbolSize + j) * 4;
    	      let pxColor = opts.color.light;

    	      if (i >= scaledMargin && j >= scaledMargin &&
    	        i < symbolSize - scaledMargin && j < symbolSize - scaledMargin) {
    	        const iSrc = Math.floor((i - scaledMargin) / scale);
    	        const jSrc = Math.floor((j - scaledMargin) / scale);
    	        pxColor = palette[data[iSrc * size + jSrc] ? 1 : 0];
    	      }

    	      imgData[posDst++] = pxColor.r;
    	      imgData[posDst++] = pxColor.g;
    	      imgData[posDst++] = pxColor.b;
    	      imgData[posDst] = pxColor.a;
    	    }
    	  }
    	}; 
    } (utils));

    (function (exports) {
    	const Utils = utils;

    	function clearCanvas (ctx, canvas, size) {
    	  ctx.clearRect(0, 0, canvas.width, canvas.height);

    	  if (!canvas.style) canvas.style = {};
    	  canvas.height = size;
    	  canvas.width = size;
    	  canvas.style.height = size + 'px';
    	  canvas.style.width = size + 'px';
    	}

    	function getCanvasElement () {
    	  try {
    	    return document.createElement('canvas')
    	  } catch (e) {
    	    throw new Error('You need to specify a canvas element')
    	  }
    	}

    	exports.render = function render (qrData, canvas, options) {
    	  let opts = options;
    	  let canvasEl = canvas;

    	  if (typeof opts === 'undefined' && (!canvas || !canvas.getContext)) {
    	    opts = canvas;
    	    canvas = undefined;
    	  }

    	  if (!canvas) {
    	    canvasEl = getCanvasElement();
    	  }

    	  opts = Utils.getOptions(opts);
    	  const size = Utils.getImageWidth(qrData.modules.size, opts);

    	  const ctx = canvasEl.getContext('2d');
    	  const image = ctx.createImageData(size, size);
    	  Utils.qrToImageData(image.data, qrData, opts);

    	  clearCanvas(ctx, canvasEl, size);
    	  ctx.putImageData(image, 0, 0);

    	  return canvasEl
    	};

    	exports.renderToDataURL = function renderToDataURL (qrData, canvas, options) {
    	  let opts = options;

    	  if (typeof opts === 'undefined' && (!canvas || !canvas.getContext)) {
    	    opts = canvas;
    	    canvas = undefined;
    	  }

    	  if (!opts) opts = {};

    	  const canvasEl = exports.render(qrData, canvas, opts);

    	  const type = opts.type || 'image/png';
    	  const rendererOpts = opts.rendererOpts || {};

    	  return canvasEl.toDataURL(type, rendererOpts.quality)
    	}; 
    } (canvas));

    var svgTag = {};

    const Utils = utils;

    function getColorAttrib (color, attrib) {
      const alpha = color.a / 255;
      const str = attrib + '="' + color.hex + '"';

      return alpha < 1
        ? str + ' ' + attrib + '-opacity="' + alpha.toFixed(2).slice(1) + '"'
        : str
    }

    function svgCmd (cmd, x, y) {
      let str = cmd + x;
      if (typeof y !== 'undefined') str += ' ' + y;

      return str
    }

    function qrToPath (data, size, margin) {
      let path = '';
      let moveBy = 0;
      let newRow = false;
      let lineLength = 0;

      for (let i = 0; i < data.length; i++) {
        const col = Math.floor(i % size);
        const row = Math.floor(i / size);

        if (!col && !newRow) newRow = true;

        if (data[i]) {
          lineLength++;

          if (!(i > 0 && col > 0 && data[i - 1])) {
            path += newRow
              ? svgCmd('M', col + margin, 0.5 + row + margin)
              : svgCmd('m', moveBy, 0);

            moveBy = 0;
            newRow = false;
          }

          if (!(col + 1 < size && data[i + 1])) {
            path += svgCmd('h', lineLength);
            lineLength = 0;
          }
        } else {
          moveBy++;
        }
      }

      return path
    }

    svgTag.render = function render (qrData, options, cb) {
      const opts = Utils.getOptions(options);
      const size = qrData.modules.size;
      const data = qrData.modules.data;
      const qrcodesize = size + opts.margin * 2;

      const bg = !opts.color.light.a
        ? ''
        : '<path ' + getColorAttrib(opts.color.light, 'fill') +
          ' d="M0 0h' + qrcodesize + 'v' + qrcodesize + 'H0z"/>';

      const path =
        '<path ' + getColorAttrib(opts.color.dark, 'stroke') +
        ' d="' + qrToPath(data, size, opts.margin) + '"/>';

      const viewBox = 'viewBox="' + '0 0 ' + qrcodesize + ' ' + qrcodesize + '"';

      const width = !opts.width ? '' : 'width="' + opts.width + '" height="' + opts.width + '" ';

      const svgTag = '<svg xmlns="http://www.w3.org/2000/svg" ' + width + viewBox + ' shape-rendering="crispEdges">' + bg + path + '</svg>\n';

      if (typeof cb === 'function') {
        cb(null, svgTag);
      }

      return svgTag
    };

    const canPromise = canPromise$1;

    const QRCode = qrcode;
    const CanvasRenderer = canvas;
    const SvgRenderer = svgTag;

    function renderCanvas (renderFunc, canvas, text, opts, cb) {
      const args = [].slice.call(arguments, 1);
      const argsNum = args.length;
      const isLastArgCb = typeof args[argsNum - 1] === 'function';

      if (!isLastArgCb && !canPromise()) {
        throw new Error('Callback required as last argument')
      }

      if (isLastArgCb) {
        if (argsNum < 2) {
          throw new Error('Too few arguments provided')
        }

        if (argsNum === 2) {
          cb = text;
          text = canvas;
          canvas = opts = undefined;
        } else if (argsNum === 3) {
          if (canvas.getContext && typeof cb === 'undefined') {
            cb = opts;
            opts = undefined;
          } else {
            cb = opts;
            opts = text;
            text = canvas;
            canvas = undefined;
          }
        }
      } else {
        if (argsNum < 1) {
          throw new Error('Too few arguments provided')
        }

        if (argsNum === 1) {
          text = canvas;
          canvas = opts = undefined;
        } else if (argsNum === 2 && !canvas.getContext) {
          opts = text;
          text = canvas;
          canvas = undefined;
        }

        return new Promise(function (resolve, reject) {
          try {
            const data = QRCode.create(text, opts);
            resolve(renderFunc(data, canvas, opts));
          } catch (e) {
            reject(e);
          }
        })
      }

      try {
        const data = QRCode.create(text, opts);
        cb(null, renderFunc(data, canvas, opts));
      } catch (e) {
        cb(e);
      }
    }

    browser.create = QRCode.create;
    browser.toCanvas = renderCanvas.bind(null, CanvasRenderer.render);
    browser.toDataURL = renderCanvas.bind(null, CanvasRenderer.renderToDataURL);

    // only svg for now.
    browser.toString = renderCanvas.bind(null, function (data, _, opts) {
      return SvgRenderer.render(data, opts)
    });

    /* src/Components/CrearQR.svelte generated by Svelte v3.59.2 */
    const file$d = "src/Components/CrearQR.svelte";

    // (18:0) {:else}
    function create_else_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Esperando enlace...";
    			add_location(p, file$d, 18, 2, 488);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(18:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (10:0) {#if url}
    function create_if_block$4(ctx) {
    	let await_block_anchor;
    	let promise;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 2,
    		error: 3
    	};

    	handle_promise(promise = /*qrPromise*/ ctx[1], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*qrPromise*/ 2 && promise !== (promise = /*qrPromise*/ ctx[1]) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(10:0) {#if url}",
    		ctx
    	});

    	return block;
    }

    // (15:2) {:catch error}
    function create_catch_block(ctx) {
    	let p;
    	let t_value = /*error*/ ctx[3].message + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			set_style(p, "color", "red");
    			add_location(p, file$d, 15, 4, 424);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*qrPromise*/ 2 && t_value !== (t_value = /*error*/ ctx[3].message + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(15:2) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (13:2) {:then src}
    function create_then_block(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*src*/ ctx[2])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = "Código QR para " + /*url*/ ctx[0]);
    			add_location(img, file$d, 13, 4, 362);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*qrPromise*/ 2 && !src_url_equal(img.src, img_src_value = /*src*/ ctx[2])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*url*/ 1 && img_alt_value !== (img_alt_value = "Código QR para " + /*url*/ ctx[0])) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(13:2) {:then src}",
    		ctx
    	});

    	return block;
    }

    // (11:20)      <p>Generando...</p>   {:then src}
    function create_pending_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Generando...";
    			add_location(p, file$d, 11, 4, 324);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(11:20)      <p>Generando...</p>   {:then src}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let h1;
    	let t1;
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*url*/ ctx[0]) return create_if_block$4;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Escanea el codigo Qr Para conocer Más";
    			t1 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			add_location(h1, file$d, 8, 0, 242);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let qrPromise;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CrearQR', slots, []);
    	let { url = "" } = $$props;
    	const writable_props = ['url'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CrearQR> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('url' in $$props) $$invalidate(0, url = $$props.url);
    	};

    	$$self.$capture_state = () => ({ QRCode: browser, url, qrPromise });

    	$$self.$inject_state = $$props => {
    		if ('url' in $$props) $$invalidate(0, url = $$props.url);
    		if ('qrPromise' in $$props) $$invalidate(1, qrPromise = $$props.qrPromise);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*url*/ 1) {
    			// Generamos una promesa que Svelte resolverá automáticamente
    			$$invalidate(1, qrPromise = url ? browser.toDataURL(url, { width: 300 }) : null);
    		}
    	};

    	return [url, qrPromise];
    }

    class CrearQR extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { url: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CrearQR",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get url() {
    		throw new Error("<CrearQR>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<CrearQR>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Components/Creditos.svelte generated by Svelte v3.59.2 */

    const file$c = "src/Components/Creditos.svelte";

    function create_fragment$d(ctx) {
    	let div3;
    	let div0;
    	let p0;
    	let t1;
    	let p1;
    	let t3;
    	let div1;
    	let p2;
    	let t5;
    	let p3;
    	let t7;
    	let div2;
    	let p4;
    	let t9;
    	let p5;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "Desarrollo del Guión Temático de la sala de arqueología del Museo Regional de Guerrero:";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = "Rosa María Reyna Robles Fecha de Creación: Marzo 2014";
    			t3 = space();
    			div1 = element("div");
    			p2 = element("p");
    			p2.textContent = "Desarrollo de la Aplicación Tactil";
    			t5 = space();
    			p3 = element("p");
    			p3.textContent = "Kevin Daniel Antúnez Ortiz Fecha de Creación: Diciembre 2025 - Junio 2026";
    			t7 = space();
    			div2 = element("div");
    			p4 = element("p");
    			p4.textContent = "Actualización museográfica de las regiones de Guerrero, especialmente Sierra y Acapulco";
    			t9 = space();
    			p5 = element("p");
    			p5.textContent = "Miguel Pérez Negrete  Fecha de Creación: Diciembre 2025";
    			attr_dev(p0, "class", "titulo svelte-1oey466");
    			add_location(p0, file$c, 1, 21, 39);
    			attr_dev(p1, "class", "texto svelte-1oey466");
    			add_location(p1, file$c, 2, 0, 150);
    			attr_dev(div0, "class", "col");
    			add_location(div0, file$c, 1, 4, 22);
    			attr_dev(p2, "class", "titulo svelte-1oey466");
    			add_location(p2, file$c, 3, 21, 252);
    			attr_dev(p3, "class", "texto svelte-1oey466");
    			add_location(p3, file$c, 4, 0, 309);
    			attr_dev(div1, "class", "col");
    			add_location(div1, file$c, 3, 4, 235);
    			attr_dev(p4, "class", "titulo svelte-1oey466");
    			add_location(p4, file$c, 5, 18, 428);
    			attr_dev(p5, "class", "texto svelte-1oey466");
    			add_location(p5, file$c, 6, 0, 538);
    			attr_dev(div2, "class", "col");
    			add_location(div2, file$c, 5, 1, 411);
    			attr_dev(div3, "class", "row");
    			add_location(div3, file$c, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t1);
    			append_dev(div0, p1);
    			append_dev(div3, t3);
    			append_dev(div3, div1);
    			append_dev(div1, p2);
    			append_dev(div1, t5);
    			append_dev(div1, p3);
    			append_dev(div3, t7);
    			append_dev(div3, div2);
    			append_dev(div2, p4);
    			append_dev(div2, t9);
    			append_dev(div2, p5);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Creditos', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Creditos> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Creditos extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Creditos",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/Components/NavBar.svelte generated by Svelte v3.59.2 */
    const file$b = "src/Components/NavBar.svelte";

    function create_fragment$c(ctx) {
    	let nav;
    	let div;
    	let a;
    	let i;
    	let t;
    	let nav_class_value;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div = element("div");
    			a = element("a");
    			i = element("i");
    			t = text("\n      Regresar");
    			attr_dev(i, "class", "bi bi-arrow-left me-2");
    			add_location(i, file$b, 11, 6, 417);
    			attr_dev(a, "class", "navbar-brand d-flex align-items-center");
    			attr_dev(a, "href", "#inicio");
    			add_location(a, file$b, 9, 4, 305);
    			attr_dev(div, "class", "container-fluid");
    			add_location(div, file$b, 7, 2, 239);
    			attr_dev(nav, "class", nav_class_value = "navbar navbar-light bg-light " + /*arreglo*/ ctx[0] + " shadow-sm");
    			add_location(nav, file$b, 6, 0, 173);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div);
    			append_dev(div, a);
    			append_dev(a, i);
    			append_dev(a, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*arreglo*/ 1 && nav_class_value !== (nav_class_value = "navbar navbar-light bg-light " + /*arreglo*/ ctx[0] + " shadow-sm")) {
    				attr_dev(nav, "class", nav_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NavBar', slots, []);
    	let { arreglo = "" } = $$props;
    	const writable_props = ['arreglo'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NavBar> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('arreglo' in $$props) $$invalidate(0, arreglo = $$props.arreglo);
    	};

    	$$self.$capture_state = () => ({ onMount, arreglo });

    	$$self.$inject_state = $$props => {
    		if ('arreglo' in $$props) $$invalidate(0, arreglo = $$props.arreglo);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [arreglo];
    }

    class NavBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { arreglo: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavBar",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get arreglo() {
    		throw new Error("<NavBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set arreglo(value) {
    		throw new Error("<NavBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Components/Tarjeta.svelte generated by Svelte v3.59.2 */
    const file$a = "src/Components/Tarjeta.svelte";

    // (15:6) {#if posicion === "arriba"}
    function create_if_block_2$2(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "images/portadas/" + /*imagen*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "card-img-top svelte-zzopf4");
    			attr_dev(img, "alt", "...");
    			add_location(img, file$a, 15, 8, 365);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*imagen*/ 1 && !src_url_equal(img.src, img_src_value = "images/portadas/" + /*imagen*/ ctx[0])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(15:6) {#if posicion === \\\"arriba\\\"}",
    		ctx
    	});

    	return block;
    }

    // (20:8) {#if texto}
    function create_if_block_1$2(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*texto*/ ctx[2]);
    			attr_dev(p, "class", "card-text");
    			add_location(p, file$a, 20, 16, 575);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*texto*/ 4) set_data_dev(t, /*texto*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(20:8) {#if texto}",
    		ctx
    	});

    	return block;
    }

    // (26:6) {#if posicion === "abajo"}
    function create_if_block$3(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "images/portadas/" + /*imagen*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "card-img-bottom svelte-zzopf4");
    			attr_dev(img, "alt", "...");
    			add_location(img, file$a, 26, 8, 792);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*imagen*/ 1 && !src_url_equal(img.src, img_src_value = "images/portadas/" + /*imagen*/ ctx[0])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(26:6) {#if posicion === \\\"abajo\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div2;
    	let a;
    	let div1;
    	let t0;
    	let div0;
    	let h5;
    	let t1;
    	let t2;
    	let t3;
    	let a_href_value;
    	let div2_class_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*posicion*/ ctx[4] === "arriba" && create_if_block_2$2(ctx);
    	let if_block1 = /*texto*/ ctx[2] && create_if_block_1$2(ctx);
    	let if_block2 = /*posicion*/ ctx[4] === "abajo" && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			a = element("a");
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div0 = element("div");
    			h5 = element("h5");
    			t1 = text(/*titulo*/ ctx[1]);
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(h5, "class", "card-title");
    			add_location(h5, file$a, 18, 8, 502);
    			attr_dev(div0, "class", "card-body text-bg-dark ");
    			add_location(div0, file$a, 17, 6, 456);
    			attr_dev(div1, "class", "card svelte-zzopf4");
    			add_location(div1, file$a, 13, 4, 304);
    			attr_dev(a, "href", a_href_value = `/modulo${/*indice*/ ctx[5]}`);
    			attr_dev(a, "class", "svelte-zzopf4");
    			add_location(a, file$a, 12, 2, 261);
    			attr_dev(div2, "class", div2_class_value = "col-sm-12 col-md-6 col-lg-" + /*tamanio*/ ctx[3] + " mb-4" + " svelte-zzopf4");
    			add_location(div2, file$a, 11, 0, 203);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, a);
    			append_dev(a, div1);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, h5);
    			append_dev(h5, t1);
    			append_dev(div0, t2);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div1, t3);
    			if (if_block2) if_block2.m(div1, null);

    			if (!mounted) {
    				dispose = action_destroyer(link.call(null, a));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*posicion*/ ctx[4] === "arriba") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2$2(ctx);
    					if_block0.c();
    					if_block0.m(div1, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*titulo*/ 2) set_data_dev(t1, /*titulo*/ ctx[1]);

    			if (/*texto*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$2(ctx);
    					if_block1.c();
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*posicion*/ ctx[4] === "abajo") {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block$3(ctx);
    					if_block2.c();
    					if_block2.m(div1, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*indice*/ 32 && a_href_value !== (a_href_value = `/modulo${/*indice*/ ctx[5]}`)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*tamanio*/ 8 && div2_class_value !== (div2_class_value = "col-sm-12 col-md-6 col-lg-" + /*tamanio*/ ctx[3] + " mb-4" + " svelte-zzopf4")) {
    				attr_dev(div2, "class", div2_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tarjeta', slots, []);
    	let { imagen } = $$props;
    	let { titulo } = $$props;
    	let { texto } = $$props;
    	let { tamanio } = $$props;
    	let { posicion } = $$props;
    	let { indice } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (imagen === undefined && !('imagen' in $$props || $$self.$$.bound[$$self.$$.props['imagen']])) {
    			console.warn("<Tarjeta> was created without expected prop 'imagen'");
    		}

    		if (titulo === undefined && !('titulo' in $$props || $$self.$$.bound[$$self.$$.props['titulo']])) {
    			console.warn("<Tarjeta> was created without expected prop 'titulo'");
    		}

    		if (texto === undefined && !('texto' in $$props || $$self.$$.bound[$$self.$$.props['texto']])) {
    			console.warn("<Tarjeta> was created without expected prop 'texto'");
    		}

    		if (tamanio === undefined && !('tamanio' in $$props || $$self.$$.bound[$$self.$$.props['tamanio']])) {
    			console.warn("<Tarjeta> was created without expected prop 'tamanio'");
    		}

    		if (posicion === undefined && !('posicion' in $$props || $$self.$$.bound[$$self.$$.props['posicion']])) {
    			console.warn("<Tarjeta> was created without expected prop 'posicion'");
    		}

    		if (indice === undefined && !('indice' in $$props || $$self.$$.bound[$$self.$$.props['indice']])) {
    			console.warn("<Tarjeta> was created without expected prop 'indice'");
    		}
    	});

    	const writable_props = ['imagen', 'titulo', 'texto', 'tamanio', 'posicion', 'indice'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tarjeta> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('imagen' in $$props) $$invalidate(0, imagen = $$props.imagen);
    		if ('titulo' in $$props) $$invalidate(1, titulo = $$props.titulo);
    		if ('texto' in $$props) $$invalidate(2, texto = $$props.texto);
    		if ('tamanio' in $$props) $$invalidate(3, tamanio = $$props.tamanio);
    		if ('posicion' in $$props) $$invalidate(4, posicion = $$props.posicion);
    		if ('indice' in $$props) $$invalidate(5, indice = $$props.indice);
    	};

    	$$self.$capture_state = () => ({
    		link,
    		imagen,
    		titulo,
    		texto,
    		tamanio,
    		posicion,
    		indice
    	});

    	$$self.$inject_state = $$props => {
    		if ('imagen' in $$props) $$invalidate(0, imagen = $$props.imagen);
    		if ('titulo' in $$props) $$invalidate(1, titulo = $$props.titulo);
    		if ('texto' in $$props) $$invalidate(2, texto = $$props.texto);
    		if ('tamanio' in $$props) $$invalidate(3, tamanio = $$props.tamanio);
    		if ('posicion' in $$props) $$invalidate(4, posicion = $$props.posicion);
    		if ('indice' in $$props) $$invalidate(5, indice = $$props.indice);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [imagen, titulo, texto, tamanio, posicion, indice];
    }

    class Tarjeta extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			imagen: 0,
    			titulo: 1,
    			texto: 2,
    			tamanio: 3,
    			posicion: 4,
    			indice: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tarjeta",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get imagen() {
    		throw new Error("<Tarjeta>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imagen(value) {
    		throw new Error("<Tarjeta>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get titulo() {
    		throw new Error("<Tarjeta>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set titulo(value) {
    		throw new Error("<Tarjeta>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get texto() {
    		throw new Error("<Tarjeta>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set texto(value) {
    		throw new Error("<Tarjeta>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tamanio() {
    		throw new Error("<Tarjeta>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tamanio(value) {
    		throw new Error("<Tarjeta>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get posicion() {
    		throw new Error("<Tarjeta>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set posicion(value) {
    		throw new Error("<Tarjeta>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get indice() {
    		throw new Error("<Tarjeta>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set indice(value) {
    		throw new Error("<Tarjeta>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Views/Home.svelte generated by Svelte v3.59.2 */
    const file$9 = "src/Views/Home.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (24:4) {#each modulos as item, index}
    function create_each_block$7(ctx) {
    	let tarjeta;
    	let current;

    	tarjeta = new Tarjeta({
    			props: {
    				imagen: /*item*/ ctx[2].imagen,
    				titulo: "Módulo " + (/*index*/ ctx[4] + 1),
    				texto: /*item*/ ctx[2].texto.toUpperCase(),
    				tamanio: "3",
    				posicion: /*item*/ ctx[2].posicion,
    				indice: /*index*/ ctx[4] + 1
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tarjeta.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tarjeta, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tarjeta.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tarjeta.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tarjeta, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(24:4) {#each modulos as item, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let h1;
    	let t1;
    	let div1;
    	let div0;
    	let t2;
    	let creditos;
    	let current;
    	let each_value = /*modulos*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	creditos = new Creditos({ $$inline: true });

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Bienvenido a la Sala de Arqueología PRUEBA";
    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			create_component(creditos.$$.fragment);
    			add_location(h1, file$9, 19, 0, 1038);
    			attr_dev(div0, "class", "row");
    			add_location(div0, file$9, 22, 2, 1129);
    			attr_dev(div1, "class", "container-fluid my-2");
    			add_location(div1, file$9, 20, 0, 1090);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div0, null);
    				}
    			}

    			append_dev(div1, t2);
    			mount_component(creditos, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*modulos*/ 1) {
    				each_value = /*modulos*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$7(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$7(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(creditos.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(creditos.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			destroy_component(creditos);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);

    	let modulos = [
    		{
    			texto: "Medio Ambiente y Cultura",
    			imagen: "modulo1.png",
    			posicion: "arriba"
    		},
    		{
    			texto: "Desarrollos Culturales Antiguos",
    			imagen: "modulo2.png",
    			posicion: "arriba"
    		},
    		{
    			texto: "El Clásico",
    			imagen: "modulo3.png",
    			posicion: "arriba"
    		},
    		{
    			texto: "El Epiclásico",
    			imagen: "modulo4.png",
    			posicion: "arriba"
    		},
    		{
    			texto: "ÚLTIMOS ASENTAMIENTOS PREHISPÁNICOS",
    			imagen: "modulo5.png",
    			posicion: "abajo"
    		},
    		{
    			texto: "ÉPOCA DE CONTACTO",
    			imagen: "modulo6.png",
    			posicion: "abajo"
    		},
    		{
    			texto: "DESARROLLOS LOCALES",
    			imagen: "modulo7.png",
    			posicion: "abajo"
    		},
    		{
    			texto: "LA TÉCNICA Y LA CREATIVIDAD",
    			imagen: "modulo8.png",
    			posicion: "abajo"
    		}
    	];

    	let imgs = Array.from({ length: 6 }, (_, i) => "/modulo1/" + (i + 1) + ".png");
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Carrousel,
    		CrearQR,
    		Creditos,
    		NavBar,
    		Tarjeta,
    		modulos,
    		imgs
    	});

    	$$self.$inject_state = $$props => {
    		if ('modulos' in $$props) $$invalidate(0, modulos = $$props.modulos);
    		if ('imgs' in $$props) imgs = $$props.imgs;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [modulos];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    // Aquí guardaremos la instancia de Audio que esté sonando
    const currentAudio = writable(null);

    /* src/Components/Pagina.svelte generated by Svelte v3.59.2 */
    const file$8 = "src/Components/Pagina.svelte";

    // (35:0) {#if audio}
    function create_if_block_4(ctx) {
    	let audio_1;
    	let audio_1_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			audio_1 = element("audio");
    			if (!src_url_equal(audio_1.src, audio_1_src_value = "audios/" + /*audio*/ ctx[5])) attr_dev(audio_1, "src", audio_1_src_value);
    			audio_1.controls = true;
    			add_location(audio_1, file$8, 35, 4, 1048);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, audio_1, anchor);
    			/*audio_1_binding*/ ctx[10](audio_1);

    			if (!mounted) {
    				dispose = listen_dev(audio_1, "play", /*manejarReproduccion*/ ctx[9], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*audio*/ 32 && !src_url_equal(audio_1.src, audio_1_src_value = "audios/" + /*audio*/ ctx[5])) {
    				attr_dev(audio_1, "src", audio_1_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(audio_1);
    			/*audio_1_binding*/ ctx[10](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(35:0) {#if audio}",
    		ctx
    	});

    	return block;
    }

    // (45:0) {#if texto}
    function create_if_block_3(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*texto*/ ctx[1]);
    			attr_dev(p, "class", "svelte-1exl2og");
    			add_location(p, file$8, 45, 4, 1184);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*texto*/ 2) set_data_dev(t, /*texto*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(45:0) {#if texto}",
    		ctx
    	});

    	return block;
    }

    // (51:4) {#if imagenes.length===1}
    function create_if_block_2$1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			set_style(img, "margin-bottom", "100px");
    			attr_dev(img, "height", "400");
    			if (!src_url_equal(img.src, img_src_value = "images/" + /*imagenes*/ ctx[2][0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$8, 51, 4, 1336);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*imagenes*/ 4 && !src_url_equal(img.src, img_src_value = "images/" + /*imagenes*/ ctx[2][0])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(51:4) {#if imagenes.length===1}",
    		ctx
    	});

    	return block;
    }

    // (48:0) {#if imagenes.length>1}
    function create_if_block_1$1(ctx) {
    	let carrousel;
    	let current;

    	carrousel = new Carrousel({
    			props: {
    				imagenes: /*imagenes*/ ctx[2],
    				indice: /*indice*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(carrousel.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(carrousel, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const carrousel_changes = {};
    			if (dirty & /*imagenes*/ 4) carrousel_changes.imagenes = /*imagenes*/ ctx[2];
    			if (dirty & /*indice*/ 8) carrousel_changes.indice = /*indice*/ ctx[3];
    			carrousel.$set(carrousel_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(carrousel.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(carrousel.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(carrousel, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(48:0) {#if imagenes.length>1}",
    		ctx
    	});

    	return block;
    }

    // (55:0) {#if mostrar}
    function create_if_block$2(ctx) {
    	let crearqr;
    	let current;

    	crearqr = new CrearQR({
    			props: { url: /*link*/ ctx[6] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(crearqr.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(crearqr, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const crearqr_changes = {};
    			if (dirty & /*link*/ 64) crearqr_changes.url = /*link*/ ctx[6];
    			crearqr.$set(crearqr_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(crearqr.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(crearqr.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(crearqr, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(55:0) {#if mostrar}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let h1;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let current_block_type_index;
    	let if_block2;
    	let t4;
    	let if_block3_anchor;
    	let current;
    	let if_block0 = /*audio*/ ctx[5] && create_if_block_4(ctx);
    	let if_block1 = /*texto*/ ctx[1] && create_if_block_3(ctx);
    	const if_block_creators = [create_if_block_1$1, create_if_block_2$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*imagenes*/ ctx[2].length > 1) return 0;
    		if (/*imagenes*/ ctx[2].length === 1) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	let if_block3 = /*mostrar*/ ctx[7] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text(/*titulo*/ ctx[0]);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			t4 = space();
    			if (if_block3) if_block3.c();
    			if_block3_anchor = empty();
    			attr_dev(h1, "id", /*id*/ ctx[4]);
    			add_location(h1, file$8, 33, 0, 1006);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t3, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, t4, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, if_block3_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*titulo*/ 1) set_data_dev(t0, /*titulo*/ ctx[0]);

    			if (!current || dirty & /*id*/ 16) {
    				attr_dev(h1, "id", /*id*/ ctx[4]);
    			}

    			if (/*audio*/ ctx[5]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(t2.parentNode, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*texto*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3(ctx);
    					if_block1.c();
    					if_block1.m(t3.parentNode, t3);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block2) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block2 = if_blocks[current_block_type_index];

    					if (!if_block2) {
    						if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block2.c();
    					} else {
    						if_block2.p(ctx, dirty);
    					}

    					transition_in(if_block2, 1);
    					if_block2.m(t4.parentNode, t4);
    				} else {
    					if_block2 = null;
    				}
    			}

    			if (/*mostrar*/ ctx[7]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty & /*mostrar*/ 128) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block$2(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(if_block3_anchor.parentNode, if_block3_anchor);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block2);
    			transition_in(if_block3);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block2);
    			transition_out(if_block3);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t3);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(t4);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(if_block3_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Pagina', slots, []);
    	let { titulo, texto, imagenes, indice, id, audio, link, mostrar } = $$props;
    	let audioRef;

    	function manejarReproduccion() {
    		currentAudio.update(audioGlobal => {
    			if (audioGlobal && audioGlobal !== audioRef) {
    				audioGlobal.pause();
    				audioGlobal.currentTime = 0;
    			}

    			return audioRef;
    		});
    	}

    	// --- ESTA ES LA PARTE NUEVA ---
    	onDestroy(() => {
    		// Cuando el componente se destruye (el usuario cambia de vista)
    		currentAudio.update(audioGlobal => {
    			// Si el audio que está sonando es el de ESTA página, lo pausamos
    			if (audioGlobal === audioRef) {
    				audioGlobal.pause();
    				return null; // Limpiamos el store
    			}

    			return audioGlobal; // Si es otro, lo dejamos tranquilo
    		});
    	});

    	$$self.$$.on_mount.push(function () {
    		if (titulo === undefined && !('titulo' in $$props || $$self.$$.bound[$$self.$$.props['titulo']])) {
    			console.warn("<Pagina> was created without expected prop 'titulo'");
    		}

    		if (texto === undefined && !('texto' in $$props || $$self.$$.bound[$$self.$$.props['texto']])) {
    			console.warn("<Pagina> was created without expected prop 'texto'");
    		}

    		if (imagenes === undefined && !('imagenes' in $$props || $$self.$$.bound[$$self.$$.props['imagenes']])) {
    			console.warn("<Pagina> was created without expected prop 'imagenes'");
    		}

    		if (indice === undefined && !('indice' in $$props || $$self.$$.bound[$$self.$$.props['indice']])) {
    			console.warn("<Pagina> was created without expected prop 'indice'");
    		}

    		if (id === undefined && !('id' in $$props || $$self.$$.bound[$$self.$$.props['id']])) {
    			console.warn("<Pagina> was created without expected prop 'id'");
    		}

    		if (audio === undefined && !('audio' in $$props || $$self.$$.bound[$$self.$$.props['audio']])) {
    			console.warn("<Pagina> was created without expected prop 'audio'");
    		}

    		if (link === undefined && !('link' in $$props || $$self.$$.bound[$$self.$$.props['link']])) {
    			console.warn("<Pagina> was created without expected prop 'link'");
    		}

    		if (mostrar === undefined && !('mostrar' in $$props || $$self.$$.bound[$$self.$$.props['mostrar']])) {
    			console.warn("<Pagina> was created without expected prop 'mostrar'");
    		}
    	});

    	const writable_props = ['titulo', 'texto', 'imagenes', 'indice', 'id', 'audio', 'link', 'mostrar'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Pagina> was created with unknown prop '${key}'`);
    	});

    	function audio_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			audioRef = $$value;
    			$$invalidate(8, audioRef);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('titulo' in $$props) $$invalidate(0, titulo = $$props.titulo);
    		if ('texto' in $$props) $$invalidate(1, texto = $$props.texto);
    		if ('imagenes' in $$props) $$invalidate(2, imagenes = $$props.imagenes);
    		if ('indice' in $$props) $$invalidate(3, indice = $$props.indice);
    		if ('id' in $$props) $$invalidate(4, id = $$props.id);
    		if ('audio' in $$props) $$invalidate(5, audio = $$props.audio);
    		if ('link' in $$props) $$invalidate(6, link = $$props.link);
    		if ('mostrar' in $$props) $$invalidate(7, mostrar = $$props.mostrar);
    	};

    	$$self.$capture_state = () => ({
    		onDestroy,
    		Carrousel,
    		currentAudio,
    		CrearQR,
    		titulo,
    		texto,
    		imagenes,
    		indice,
    		id,
    		audio,
    		link,
    		mostrar,
    		audioRef,
    		manejarReproduccion
    	});

    	$$self.$inject_state = $$props => {
    		if ('titulo' in $$props) $$invalidate(0, titulo = $$props.titulo);
    		if ('texto' in $$props) $$invalidate(1, texto = $$props.texto);
    		if ('imagenes' in $$props) $$invalidate(2, imagenes = $$props.imagenes);
    		if ('indice' in $$props) $$invalidate(3, indice = $$props.indice);
    		if ('id' in $$props) $$invalidate(4, id = $$props.id);
    		if ('audio' in $$props) $$invalidate(5, audio = $$props.audio);
    		if ('link' in $$props) $$invalidate(6, link = $$props.link);
    		if ('mostrar' in $$props) $$invalidate(7, mostrar = $$props.mostrar);
    		if ('audioRef' in $$props) $$invalidate(8, audioRef = $$props.audioRef);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		titulo,
    		texto,
    		imagenes,
    		indice,
    		id,
    		audio,
    		link,
    		mostrar,
    		audioRef,
    		manejarReproduccion,
    		audio_1_binding
    	];
    }

    class Pagina extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			titulo: 0,
    			texto: 1,
    			imagenes: 2,
    			indice: 3,
    			id: 4,
    			audio: 5,
    			link: 6,
    			mostrar: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Pagina",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get titulo() {
    		throw new Error("<Pagina>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set titulo(value) {
    		throw new Error("<Pagina>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get texto() {
    		throw new Error("<Pagina>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set texto(value) {
    		throw new Error("<Pagina>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get imagenes() {
    		throw new Error("<Pagina>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imagenes(value) {
    		throw new Error("<Pagina>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get indice() {
    		throw new Error("<Pagina>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set indice(value) {
    		throw new Error("<Pagina>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Pagina>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Pagina>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get audio() {
    		throw new Error("<Pagina>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set audio(value) {
    		throw new Error("<Pagina>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get link() {
    		throw new Error("<Pagina>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<Pagina>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mostrar() {
    		throw new Error("<Pagina>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mostrar(value) {
    		throw new Error("<Pagina>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var paginas$7 = [
    	{
    		titulo: "BIENVENIDOS A LA SALA DE ÉPOCA PREHISPÁNICA",
    		texto: "Las sociedades que habitaron el ahora territorio\nguerrerense en época prehispánica dejaron ricos y variados testimonios\nque permiten conocer gran parte de su desarrollo histórico y cultural.\nEn tiempos anteriores a la conquista española Guerrero fue\nhabitado por poblaciones diversas, muchas desparecidas antes de que\ncualquier cronista pudiera escribir sobre ellas. Ya que no existe esa\nhistoria escrita nos auxiliamos de la arqueología, que no sólo descubre\nedificios en ruinas y objetos antiguos, sino que recaba datos y evidencias\nque permiten conocer y entender el desarrollo de las sociedades a lo\nlargo del tiempo.\nLos periodos mejor conocidos abarcan 3000 años (entre\n1500 a. C. y 1500 d. C.). Cada uno se distingue por su arquitectura,\ncerámica, figurillas, escultura de piedra y muchos materiales más que\natestiguan sus avances tecnológicos, su economía y política, pero\ntambién sus formas de vida, costumbres funerarias, arte y religión.\nA lo largo de esta sala se muestran algunos de los logros\nmás significativos de los antiguos pobladores de Guerrero, tanto en su\nunidad como en su diversidad.",
    		imagenes: [
    		],
    		audio: "1.mp3",
    		url: "www.google.com"
    	},
    	{
    		titulo: "MESOAMÉRICA Y GUERRERO",
    		texto: "Mesoamérica es un amplio territorio que abarca parte de\nMéxico y Centroamérica. Sus límites extremos se delimitaron con\nbase en diversos rasgos culturales vigentes en el siglo XVI, que\ntambién la subdividen en varias áreas.\nPara la época prehispánica, hasta hace pocos años se\nincluía a Guerrero en el Occidente de México, pero ahora se le ha\nseparado porque tiene características distintas a esa área y en\ncambio presenta otros rasgos autóctonos que lo distinguen, como los\nde la cultura arqueológica Mezcala.",
    		imagenes: [
    			"/modulo1/1.png"
    		],
    		audio: "2.mp3",
    		url: "www.google.com"
    	},
    	{
    		titulo: "MEDIO AMBIENTE Y CULTURA",
    		texto: "Los seres humanos se desarrollan en un ambiente\nnatural determinado. A veces saben aprovecharlo de manera\nracional, permitiendo que el ciclo de vida animal y vegetal continúe\nsu curso, pero otras veces lo sobreexplota eliminando la posibilidad\nde utilizarlo en el futuro.\nGuerrero ha sido sobreexplotado. Los paisajes\nactuales no corresponden a los que tuvo en la antigüedad, cuando\ncontaba con grandes extensiones de bosques, sus ríos eran\ncristalinos y había una rica y variada fauna.\nEn ese ambiente más propicio vivieron los antiguos\npobladores de Guerrero, quienes supieron utilizarlo de manera\ninteligente y lo transformaron para su beneficio pero sin depredarlo.\nEsto les permitió fabricar sus herramientas y utensilios con los\nmateriales más adecuados, observar la relación entre los\nfenómenos naturales y los ciclos agrícolas, crear poblados y\nciudades y dedicarse a cuestiones más complejas, como la política,\nla economía, el arte y la religión.\nGracias al estudio de los restos materiales dejados\npor sus variadas actividades es posible situarlos en momentos\nespecíficos a lo largo de toda la época prehispánica",
    		imagenes: [
    		],
    		audio: "3.mp3",
    		url: "www.google.com"
    	},
    	{
    		titulo: "GUERRERO: FISIOGRAFÍA, FLORA Y FAUNA",
    		texto: "Como ustedes bien saben, Guerrero se\ncaracteriza por estar cubierto con cadenas de montañas\ndonde nacen numerosos ríos y arroyos de temporal, los que\ndesembocan en el caudaloso Río de las Balsas y en la costa\ndel Pacífico.\nEl hombre precortesiano aprovechó y\ntransformó con eficiencia el medio natural. Su principal\nmodo de subsistencia fue la agricultura. Ya que las lluvias\neran escasas, desarrolló tecnologías agrícolas apropiadas\npara su entorno inmediato, ya sea creando terrazas en\nlugares escarpados o construyendo sistemas de irrigación\nen las partes planas, lo que aseguraba no sólo la\nregularidad sino la alta productividad de los cultivos.\nPara complementar su dieta recolectó plantas\ny pequeños animales y cazó los de mayor tamaño. También\nusó los recursos minerales, animales y vegetales como\nmaterial de construcción, para fabricar sus herramientas y\nobjetos de barro, como remedio en diversas enfermedades y\npara celebrar sus rituales.\nA partir de la época colonial, pero sobre todo\nen los últimos 100 años, la tala inmoderada y la\ndeforestación han convertido amplias regiones de Guerrero,\nantaño florecientes, en páramos improductivos en los que se\nha extinguido la fauna original.",
    		imagenes: [
    			"modulo1/2.png",
    			"modulo1/3.png",
    			"modulo1/4.png",
    			"modulo1/5.png"
    		],
    		audio: "4.mp3",
    		url: "www.google.com"
    	},
    	{
    		titulo: "GUERRERO: FISIOGRAFÍA, FLORA Y FAUNA continuación...",
    		texto: "En Guerrero se conocen varias\nregiones geográfico-culturales que han cambiado\na lo largo del tiempo. Para el Preclásico o\nFormativo se sabe que prácticamente todo el\nestado participó en la formación y evolución de la\ncultura olmeca. Para épocas posteriores se ha\ndelimitado con bastante exactitud la región y\ncultura Mezcala pero otras, como la mixteca-\ntlapaneca, la yope, la de la alta Sierra Madre del\nSur y de la Costa Chica y Grande aún son poco\nconocidas.",
    		imagenes: [
    			"modulo1/6.png"
    		],
    		audio: "5.mp3",
    		url: "www.google.com"
    	}
    ];

    /* src/Views/Modulo1.svelte generated by Svelte v3.59.2 */
    const file$7 = "src/Views/Modulo1.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	child_ctx[2] = i;
    	return child_ctx;
    }

    // (12:2) {#each paginas as pagina,i}
    function create_each_block$6(ctx) {
    	let div2;
    	let h2;
    	let button;
    	let t0_value = /*pagina*/ ctx[0].titulo + "";
    	let t0;
    	let t1;
    	let div1;
    	let div0;
    	let pagina;
    	let t2;
    	let current;

    	pagina = new Pagina({
    			props: {
    				titulo: /*pagina*/ ctx[0].titulo,
    				texto: /*pagina*/ ctx[0].texto,
    				imagenes: /*pagina*/ ctx[0].imagenes,
    				indice: /*i*/ ctx[2],
    				id: /*i*/ ctx[2],
    				audio: "modulo1/" + /*pagina*/ ctx[0].audio
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			h2 = element("h2");
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");
    			create_component(pagina.$$.fragment);
    			t2 = space();
    			attr_dev(button, "class", "accordion-button");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "data-bs-toggle", "collapse");
    			attr_dev(button, "data-bs-target", "#collapse" + /*i*/ ctx[2]);
    			attr_dev(button, "aria-expanded", /*i*/ ctx[2] === 0 ? 'true' : 'false');
    			attr_dev(button, "aria-controls", "collapse" + /*i*/ ctx[2]);
    			add_location(button, file$7, 14, 6, 492);
    			attr_dev(h2, "class", "accordion-header");
    			add_location(h2, file$7, 13, 4, 456);
    			attr_dev(div0, "class", "accordion-body");
    			add_location(div0, file$7, 19, 6, 848);
    			attr_dev(div1, "id", "collapse" + /*i*/ ctx[2]);
    			attr_dev(div1, "class", "accordion-collapse collapse " + (/*i*/ ctx[2] === 0 ? 'show' : ''));
    			attr_dev(div1, "data-bs-parent", "#accordionExample");
    			add_location(div1, file$7, 18, 4, 723);
    			attr_dev(div2, "class", "accordion-item");
    			add_location(div2, file$7, 12, 4, 423);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h2);
    			append_dev(h2, button);
    			append_dev(button, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			mount_component(pagina, div0, null);
    			append_dev(div2, t2);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pagina.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pagina.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(pagina);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(12:2) {#each paginas as pagina,i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let navbar;
    	let t0;
    	let h1;
    	let t2;
    	let div;
    	let t3;
    	let crearqr;
    	let t4;
    	let creditos;
    	let current;
    	navbar = new NavBar({ $$inline: true });
    	let each_value = paginas$7;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	crearqr = new CrearQR({
    			props: {
    				url: "https://mediateca.inah.gob.mx/islandora_74/islandora/object/issue%3A1358"
    			},
    			$$inline: true
    		});

    	creditos = new Creditos({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "MÓDULO 1 - MEDIO AMBIENTE Y CULTURA";
    			t2 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			create_component(crearqr.$$.fragment);
    			t4 = space();
    			create_component(creditos.$$.fragment);
    			add_location(h1, file$7, 8, 0, 297);
    			attr_dev(div, "class", "accordion");
    			attr_dev(div, "id", "accordionExample");
    			add_location(div, file$7, 10, 0, 343);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}

    			insert_dev(target, t3, anchor);
    			mount_component(crearqr, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(creditos, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*paginas*/ 0) {
    				each_value = paginas$7;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(crearqr.$$.fragment, local);
    			transition_in(creditos.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(crearqr.$$.fragment, local);
    			transition_out(creditos.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(crearqr, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(creditos, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Modulo1', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Modulo1> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Creditos,
    		NavBar,
    		Pagina,
    		CrearQR,
    		paginas: paginas$7
    	});

    	return [];
    }

    class Modulo1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modulo1",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    var paginas$6 = [
    	{
    		titulo: "PRECLÁSICO- OLMECA",
    		texto: "El Preclásico o Formativo es el periodo más\nlargo de la época prehispánica pues ocurre en los 15 siglos\nanteriores a nuestra era. Entonces se consolida la\nagricultura, el sedentarismo, la fabricación de la cerámica y\nse sientan las bases de la arquitectura, la diferenciación\nsocial, la política, el arte y la religión.\nDeben saber que mientras más antiguo es un\nasentamiento humano más difícil es localizarlo, sin\nembargo se conoce que entre 1250 y 500 años a. C.,\nGuerrero, como muchos otros estados modernos\nlocalizados al sur de nuestro país y parte de\nCentroamérica, estuvo ocupado por grupos étnicos\ndistintos, que hablaban diferentes lenguas y poseían una\ncultura propia, pero que además compartían numerosos\nrasgos de una cultura común, la olmeca, considerada por\nmuchos como la primera civilización de la naciente\nMesoamérica.\nEn Guerrero se encuentran algunos de los\nvestigios más sobresalientes de la cultura olmeca: grandes\nesculturas y asentamientos monumentales con arquitectura\nde barro y piedra; pintura rupestre; figurillas de barro y\npiedra y variadas vasijas de barro decoradas con\nmagníficos diseños incisos o excavados que desde\nentonces conviven con cerámicas locales, como la llamada\nBlanco Granular.",
    		imagenes: [
    			"modulo2/1.png",
    			"modulo2/2.png",
    			"modulo2/3.png",
    			"modulo2/4.png"
    		],
    		audio: "1.mp3",
    		url: "www.google.com"
    	},
    	{
    		titulo: "TEOPANTECUANITLÁN (Olmeca Medio)",
    		texto: "Teopantecuanitlán, en el actual municipio de Copalillo, fue un\nsitio rector de grandes proporciones y adelantos tecnológicos que tuvo su\napogeo entre 1000 y 500 años antes de nuestra era. Aunque los edificios más\ngrandes se concentran en 50 000 m2, se calcula que el asentamiento se\nextendió sobre 160 hectáreas.\nSu ubicación privilegiada en el extenso valle de Copalillo, donde\nconfluyen los ríos Amacuzac y Mezcala, lo proveyó con dos recursos\nindispensables para lograr su crecimiento: los fértiles campos de cultivo y el\nagua dulce, a los que aunó un sistema hidráulico impresionante formado por\nun canal de irrigación que se desprende de una presa nutrida por un manantial\ny por los escurrimientos de los cerros circundantes.\nEl conjunto arquitectónico más importante es El Recinto, que\nconsiste en un patio hundido rodeado por muros levantados con enormes\nbloques de piedra, recortados en forma tal que no se necesitó unirlos con\nmezcla. Sobre dos de los muros, al este y oeste, se incrustaron cuatro\nesculturas monolíticas que al parecer representan deidades del agua o de la\nlluvia. Sus ojos almendrados y su boca con las comisuras de los labios hacia\nabajo, que recuerda el hocico de un jaguar, son rasgos comunes del estilo\nolmeca. Con las manos sostienen “antorchas” o mazorcas de maíz y portan\nmanoplas y rodilleras, atuendos propios de los jugadores de pelota.\nAl norte de El Recinto quedan grandes fragmentos de esculturas\ncon rasgos humanos, una cabeza semejante a las encontradas en la Costa\ndel Golfo pero de menores proporciones y una gran escultura que representa\na una rana. Hacia el norte del conjunto principal, donde se encuentra el canal\nde irrigación, también hay dos basamentos decorados con un diseño de\n“puntos y barras” intercalado con nichos verticales. Arquitectura similar fue\nlocalizada recientemente en el sitio de Zazacatla, Morelos, donde se\ndescubrieron dos esculturas del más puro estilo olmeca colocadas en los\nnichos.",
    		imagenes: [
    			"modulo2/5.png",
    			"modulo2/6.png",
    			"modulo2/7.png",
    			"modulo2/8.png",
    			"modulo2/9.png",
    			"modulo2/10.png",
    			"modulo2/11.png",
    			"modulo2/12.png",
    			"modulo2/13.png",
    			"modulo2/14.png"
    		],
    		audio: "2.mp3",
    		url: "www.google.com"
    	},
    	{
    		titulo: "TUMBA DE CHILPANCINGO (Olmeca medio)",
    		texto: "Al oriente de Chilpancingo se excavó un\npequeño espacio con diversas construcciones funerarias,\nentre ellas una tumba techada con “bóveda falsa”.\nEn varios sitios de Guerrero se han hallado\nestructuras con ese tipo de techumbre, y hasta hace\npocos años se creía que se debía a influencias venidas\nde la zona maya. Sin embargo, por las vasijas\nofrendadas en esta tumba se sabe que fue utilizada entre\n1000 y 500 a. C., lo que la convierte en el caso más\nantiguo donde se usó esa técnica constructiva.",
    		imagenes: [
    			"modulo2/15.png",
    			"modulo2/16.png",
    			"modulo2/17.png"
    		],
    		audio: "3.mp3",
    		url: "www.google.com"
    	},
    	{
    		titulo: "OFRENDA FUNERARIA (Olmeca medio)",
    		texto: "Del interior de la tumba se recobraron los\nrestos humanos de al menos cinco individuos adultos,\nacompañados con objetos de piedra verde: jadeíta, diorita y\nfeldespato, así como trece vasijas, cinco de ellas decoradas\ncon diseños de la iconografía olmeca.\nEn las vasijas se ofrendó copal, sal, maíz y\nrestos de otros vegetales que fueron intencionalmente\nquemados, quizá para que “murieran” y así pudieran ser\nútiles a los difuntos en el más allá.",
    		imagenes: [
    			"modulo2/18.png",
    			"modulo2/19.png",
    			"modulo2/20.png",
    			"modulo2/21.png",
    			"modulo2/22.png"
    		],
    		audio: "4.mp3",
    		url: "www.google.com"
    	},
    	{
    		titulo: "TRONCOCÓNICA DE CHILPANCINGO: TEMIXCO II",
    		texto: "Un rasgo común en el Preclásico de\nMesoamérica fue el uso de las llamadas “formaciones\ntroncocónicas”, oquedades en forma de cono truncado\nexcavadas en el subsuelo que\noriginalmente\nfuncionaron como graneros. Al caer en desuso, es\nusual encontrar en ellas enterramientos humanos,\ncomo en la localizada al este de Chilpancingo, cerca\nde donde se excavó la tumba techada con bóveda\nfalsa.\nAhí se encontraron los huesos de un\nindividuo adulto al que se ofrendó una bella figurilla de\nestilo olmeca, conocida como “cara de niño” y un\npequeño botellón.",
    		imagenes: [
    			"modulo2/23.png",
    			"modulo2/24.png",
    			"modulo2/25.png"
    		],
    		audio: "5.mp3"
    	},
    	{
    		titulo: "PINTURA RUPESTRE DE ESTILO OLMECA EN GUERRERO",
    		texto: "Guerrero\nes,\nhasta ahora, el territorio de la\nMesoamérica\nprehispánica\ndonde se ha encontrado el\nmayor número de pintura\nrupestre de estilo olmeca.\nSobre rocas naturales se\npintaron personajes ataviados\ncon vistosos ropajes y tocados\nen la cabeza. Para pintarlos se\nutilizaron brillantes pigmentos\nnaturales en colores rojo,\nnegro, amarillo, verde y\nblanco.\nLas\nescenas\nrepresentadas dan cuenta de\nlas creencias que tenían sobre\nla naturaleza y su relación\nindisoluble con los seres\nhumanos.",
    		imagenes: [
    			"modulo2/26.png"
    		],
    		audio: "6.mp3",
    		url: "www.google.com"
    	},
    	{
    		titulo: "OXTOTITLÁN",
    		texto: "Esta magnífica pintura policromada se\nencuentra cerca de Acatlán, municipio\nde Chilapa. Fue pintada sobre un\nacantilado a 10 m de altura frente al\nsitio del cerro Quiotepec. En ella se\nrepresenta un personaje ricamente\nataviado sentado sobre la cabeza de\nun monstruo-jaguar que simula una\ncueva. Su tocado aparenta ser de un\nbúho cuyas alas caen como capa. La\nescena se relaciona con el agua, la\nlluvia y la fertilidad.",
    		imagenes: [
    			"modulo2/27.png"
    		],
    		audio: "7.mp3",
    		url: "www.google.com"
    	},
    	{
    		titulo: "JUXTLAHUACA",
    		texto: "En las grutas de Juxtlahuaca,\nmunicipio de Quechultenango, se\nencuentra esta pintura de 1.5 por 2.5\nm. En ella se representa a una figura\nhumana y a un jaguar. Por la sugestiva\nposición de la cola del animal se le ha\ninterpretado como la unión sexual entre\nestos dos seres, que evoca\nlos\norígenes míticos, pero también se\nrelaciona con la fertilidad, el agua y la\nlluvia.",
    		imagenes: [
    			"modulo2/28.png"
    		],
    		audio: "8.mp3",
    		url: "www.google.com"
    	},
    	{
    		titulo: "CAHUAZIZIQUI",
    		texto: "Este fragmento fue pintado sobre\nlas paredes de la cueva de\nCahuaziziqui,\nmunicipio\nde\nCopanatoyac. Se ha interpretado\nque el personaje oficia un ritual\npara propiciar la lluvia y la\nfertilidad, necesarias en las\nprácticas agrícolas. Frente a su\nboca aparece una pequeña voluta\nornamentada, lo que indicaría que\nsu petición fue acompañada de un\ncanto.",
    		imagenes: [
    			"modulo2/29.png"
    		],
    		audio: "9.mp3",
    		url: "www.google.com"
    	},
    	{
    		titulo: "EL ESTILO XOCHIPALA",
    		texto: "Entre los desarrollos culturales\ndel Preclásico en Guerrero sobresalen las\nbellas figurillas de estilo Xochipala,\nrealísticamente modeladas en barro, las\ncuales\nno\nhan\nsido\nexcavadas\narqueológicamente por lo que se desconoce\ncon exactitud su antigüedad y a qué otras\nevidencias estuvieron asociadas.",
    		imagenes: [
    			"modulo2/30.png",
    			"modulo2/31.png",
    			"modulo2/32.png",
    			"modulo2/33.png",
    			"modulo2/34.png",
    			"modulo2/35.png",
    			"modulo2/36.png"
    		],
    		audio: "10.mp3",
    		url: "www.google.com"
    	},
    	{
    		titulo: "SURGIMIENTO DE LA CULTURA MEZCALA",
    		texto: "Al iniciar el Preclásico Tardío, hacia 500\na.C., en toda Mesoamérica se diluyeron los rasgos\nde la cultura olmeca y surgieron culturas locales y\nregionales diferenciadas como la zapoteca en\nOaxaca, la totonaca en Veracruz o la maya en el\nsureste de México y Centroamérica. Guerrero vio\nnacer entonces la “cultura Mezcala”.\nAntes sólo se conocía como “estilo\nMezcala” a diversos objetos de piedra que en\nGuerrero se habían saqueado por millares, entre los\nque destacan las figurillas de forma humana con los\nrasgos\nfaciales\ny\ncorporales\nsumamente\nesquemáticos.",
    		imagenes: [
    			"modulo2/37.png",
    			"modulo2/38.png",
    			"modulo2/39.png",
    			"modulo2/40.png"
    		],
    		audio: "11.mp3",
    		url: "www.google.com"
    	},
    	{
    		titulo: "AHUINAHUAC",
    		texto: "Hasta hace pocos años se desconocía\ndesde cuando habían sido elaboradas las pequeñas\nesculturas de estilo Mezcala y con qué otros\nmateriales estaban asociadas. Estudios recientes\nen Ahuinahuac lograron fecharlas por medio del\nradiocarbono hacia 500 a. C.\nAhora se sabe que las esculturas de\nestilo Mezcala no están aisladas, sino que forman\nparte de una cultura arqueológica que comprende\notros vestigios culturales de cerámica, piedra,\nconcha, obsidiana y muchos materiales más.\nIgualmente se conoce que desde su más temprana\naparición se les encuentra en lugares que tienen\nuna compleja arquitectura en la que ya se utilizan\nsegmentos circulares de piedra o “quesos” para\nformar columnas, como en Ahuinahuac.",
    		imagenes: [
    			"modulo2/41.png",
    			"modulo2/42.png",
    			"modulo2/43.png"
    		],
    		audio: "12.mp3",
    		url: "www.google.com"
    	},
    	{
    		titulo: "CUETLAJUCHITLÁN",
    		texto: "Los restos de un sitio de la cultura Mezcala\nse encuentran en Cuetlajuchitlán, cerca de Paso Morelos,\nmunicipio de Huitzuco. Aunque este sitio fue bastante\ndestruido durante la construcción de la autopista\nCuernavaca-Acapulco, todavía es posible observar su\ntraza con estrechas calles enlajadas que delimitan\nconjuntos habitacionales y ceremoniales.\nSus edificios, colocados alrededor de patios\nhundidos, fueron construidos con bloques de piedra\ntrabajados con excepcional maestría y en su interior\ntienen columnas de una pieza o formadas por “quesos”\nque sirvieron para sostener los techos. También se\ndescubrieron un temascal y dos tinas monolíticas que\nposiblemente se utilizaron para baños rituales y se\nrecuperaron varios entierros humanos con ricas ofrendas\ny dos burdas figurillas de estilo Mezcala. Su ocupación\nprincipal ocurrió entre 200 a. C. y 200 d. C.",
    		imagenes: [
    			"modulo2/44.png",
    			"modulo2/45.png",
    			"modulo2/46.png",
    			"modulo2/47.png",
    			"modulo2/48.png"
    		],
    		audio: "13.mp3",
    		url: "www.google.com"
    	},
    	{
    		titulo: "CONJUNTO HABITACIONAL DE TEZAHUAPA",
    		texto: "Durante el Preclásico, la arquitectura\nen Guerrero se desarrolló precozmente en sitios\ncomo Ahuinahuac, Cuetlajuchitlán o Tezahuapa.\nTezahuapa tuvo dos momentos de\nocupación: al primero corresponde un conjunto\npalaciego; al segundo una construcción funeraria y\nun basurero que contuvo varias vasijas.\nEl área palaciega (1000-750 a.C.)\ntiene edificios alrededor de un patio hundido que\ndesplantan sobre basamentos con talud-tablero\ncubiertos con estuco, ejemplo prematuro del talud-\ntablero que posteriormente floreció en Teotihuacán.",
    		imagenes: [
    			"modulo2/49.png",
    			"modulo2/50.png",
    			"modulo2/51.png"
    		],
    		audio: "14.mp3",
    		url: "www.google.com"
    	},
    	{
    		titulo: "VASIJAS RITUALES",
    		texto: "En el basurero, fechado entre 750 y 400 a. C., se\nexcavaron varias vasijas fragmentadas de formas y\ndecoraciones caprichosas que contuvieron flores y plantas\nmedicinales carbonizadas, posiblemente quemadas durante\nalgún ritual específico, después del cual se desecharon los\nrecipientes.",
    		imagenes: [
    			"modulo2/52.png",
    			"modulo2/53.png",
    			"modulo2/54.png"
    		],
    		audio: "15.mp3",
    		url: "www.google.com"
    	}
    ];

    var scrollspy = {exports: {}};

    var baseComponent = {exports: {}};

    var data = {exports: {}};

    /*!
      * Bootstrap data.js v5.3.8 (https://getbootstrap.com/)
      * Copyright 2011-2025 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
      * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
      */

    var hasRequiredData;

    function requireData () {
    	if (hasRequiredData) return data.exports;
    	hasRequiredData = 1;
    	(function (module, exports) {
    		(function (global, factory) {
    		  module.exports = factory() ;
    		})(commonjsGlobal, (function () {
    		  /**
    		   * --------------------------------------------------------------------------
    		   * Bootstrap dom/data.js
    		   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
    		   * --------------------------------------------------------------------------
    		   */

    		  /**
    		   * Constants
    		   */

    		  const elementMap = new Map();
    		  const data = {
    		    set(element, key, instance) {
    		      if (!elementMap.has(element)) {
    		        elementMap.set(element, new Map());
    		      }
    		      const instanceMap = elementMap.get(element);

    		      // make it clear we only want one instance per element
    		      // can be removed later when multiple key/instances are fine to be used
    		      if (!instanceMap.has(key) && instanceMap.size !== 0) {
    		        // eslint-disable-next-line no-console
    		        console.error(`Bootstrap doesn't allow more than one instance per element. Bound instance: ${Array.from(instanceMap.keys())[0]}.`);
    		        return;
    		      }
    		      instanceMap.set(key, instance);
    		    },
    		    get(element, key) {
    		      if (elementMap.has(element)) {
    		        return elementMap.get(element).get(key) || null;
    		      }
    		      return null;
    		    },
    		    remove(element, key) {
    		      if (!elementMap.has(element)) {
    		        return;
    		      }
    		      const instanceMap = elementMap.get(element);
    		      instanceMap.delete(key);

    		      // free up element references if there are no instances left for an element
    		      if (instanceMap.size === 0) {
    		        elementMap.delete(element);
    		      }
    		    }
    		  };

    		  return data;

    		}));
    		
    	} (data));
    	return data.exports;
    }

    var eventHandler = {exports: {}};

    var util = {exports: {}};

    /*!
      * Bootstrap index.js v5.3.8 (https://getbootstrap.com/)
      * Copyright 2011-2025 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
      * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
      */

    var hasRequiredUtil;

    function requireUtil () {
    	if (hasRequiredUtil) return util.exports;
    	hasRequiredUtil = 1;
    	(function (module, exports) {
    		(function (global, factory) {
    		  factory(exports) ;
    		})(commonjsGlobal, (function (exports) {
    		  /**
    		   * --------------------------------------------------------------------------
    		   * Bootstrap util/index.js
    		   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
    		   * --------------------------------------------------------------------------
    		   */

    		  const MAX_UID = 1000000;
    		  const MILLISECONDS_MULTIPLIER = 1000;
    		  const TRANSITION_END = 'transitionend';

    		  /**
    		   * Properly escape IDs selectors to handle weird IDs
    		   * @param {string} selector
    		   * @returns {string}
    		   */
    		  const parseSelector = selector => {
    		    if (selector && window.CSS && window.CSS.escape) {
    		      // document.querySelector needs escaping to handle IDs (html5+) containing for instance /
    		      selector = selector.replace(/#([^\s"#']+)/g, (match, id) => `#${CSS.escape(id)}`);
    		    }
    		    return selector;
    		  };

    		  // Shout-out Angus Croll (https://goo.gl/pxwQGp)
    		  const toType = object => {
    		    if (object === null || object === undefined) {
    		      return `${object}`;
    		    }
    		    return Object.prototype.toString.call(object).match(/\s([a-z]+)/i)[1].toLowerCase();
    		  };

    		  /**
    		   * Public Util API
    		   */

    		  const getUID = prefix => {
    		    do {
    		      prefix += Math.floor(Math.random() * MAX_UID);
    		    } while (document.getElementById(prefix));
    		    return prefix;
    		  };
    		  const getTransitionDurationFromElement = element => {
    		    if (!element) {
    		      return 0;
    		    }

    		    // Get transition-duration of the element
    		    let {
    		      transitionDuration,
    		      transitionDelay
    		    } = window.getComputedStyle(element);
    		    const floatTransitionDuration = Number.parseFloat(transitionDuration);
    		    const floatTransitionDelay = Number.parseFloat(transitionDelay);

    		    // Return 0 if element or transition duration is not found
    		    if (!floatTransitionDuration && !floatTransitionDelay) {
    		      return 0;
    		    }

    		    // If multiple durations are defined, take the first
    		    transitionDuration = transitionDuration.split(',')[0];
    		    transitionDelay = transitionDelay.split(',')[0];
    		    return (Number.parseFloat(transitionDuration) + Number.parseFloat(transitionDelay)) * MILLISECONDS_MULTIPLIER;
    		  };
    		  const triggerTransitionEnd = element => {
    		    element.dispatchEvent(new Event(TRANSITION_END));
    		  };
    		  const isElement = object => {
    		    if (!object || typeof object !== 'object') {
    		      return false;
    		    }
    		    if (typeof object.jquery !== 'undefined') {
    		      object = object[0];
    		    }
    		    return typeof object.nodeType !== 'undefined';
    		  };
    		  const getElement = object => {
    		    // it's a jQuery object or a node element
    		    if (isElement(object)) {
    		      return object.jquery ? object[0] : object;
    		    }
    		    if (typeof object === 'string' && object.length > 0) {
    		      return document.querySelector(parseSelector(object));
    		    }
    		    return null;
    		  };
    		  const isVisible = element => {
    		    if (!isElement(element) || element.getClientRects().length === 0) {
    		      return false;
    		    }
    		    const elementIsVisible = getComputedStyle(element).getPropertyValue('visibility') === 'visible';
    		    // Handle `details` element as its content may falsie appear visible when it is closed
    		    const closedDetails = element.closest('details:not([open])');
    		    if (!closedDetails) {
    		      return elementIsVisible;
    		    }
    		    if (closedDetails !== element) {
    		      const summary = element.closest('summary');
    		      if (summary && summary.parentNode !== closedDetails) {
    		        return false;
    		      }
    		      if (summary === null) {
    		        return false;
    		      }
    		    }
    		    return elementIsVisible;
    		  };
    		  const isDisabled = element => {
    		    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
    		      return true;
    		    }
    		    if (element.classList.contains('disabled')) {
    		      return true;
    		    }
    		    if (typeof element.disabled !== 'undefined') {
    		      return element.disabled;
    		    }
    		    return element.hasAttribute('disabled') && element.getAttribute('disabled') !== 'false';
    		  };
    		  const findShadowRoot = element => {
    		    if (!document.documentElement.attachShadow) {
    		      return null;
    		    }

    		    // Can find the shadow root otherwise it'll return the document
    		    if (typeof element.getRootNode === 'function') {
    		      const root = element.getRootNode();
    		      return root instanceof ShadowRoot ? root : null;
    		    }
    		    if (element instanceof ShadowRoot) {
    		      return element;
    		    }

    		    // when we don't find a shadow root
    		    if (!element.parentNode) {
    		      return null;
    		    }
    		    return findShadowRoot(element.parentNode);
    		  };
    		  const noop = () => {};

    		  /**
    		   * Trick to restart an element's animation
    		   *
    		   * @param {HTMLElement} element
    		   * @return void
    		   *
    		   * @see https://www.harrytheo.com/blog/2021/02/restart-a-css-animation-with-javascript/#restarting-a-css-animation
    		   */
    		  const reflow = element => {
    		    element.offsetHeight; // eslint-disable-line no-unused-expressions
    		  };
    		  const getjQuery = () => {
    		    if (window.jQuery && !document.body.hasAttribute('data-bs-no-jquery')) {
    		      return window.jQuery;
    		    }
    		    return null;
    		  };
    		  const DOMContentLoadedCallbacks = [];
    		  const onDOMContentLoaded = callback => {
    		    if (document.readyState === 'loading') {
    		      // add listener on the first call when the document is in loading state
    		      if (!DOMContentLoadedCallbacks.length) {
    		        document.addEventListener('DOMContentLoaded', () => {
    		          for (const callback of DOMContentLoadedCallbacks) {
    		            callback();
    		          }
    		        });
    		      }
    		      DOMContentLoadedCallbacks.push(callback);
    		    } else {
    		      callback();
    		    }
    		  };
    		  const isRTL = () => document.documentElement.dir === 'rtl';
    		  const defineJQueryPlugin = plugin => {
    		    onDOMContentLoaded(() => {
    		      const $ = getjQuery();
    		      /* istanbul ignore if */
    		      if ($) {
    		        const name = plugin.NAME;
    		        const JQUERY_NO_CONFLICT = $.fn[name];
    		        $.fn[name] = plugin.jQueryInterface;
    		        $.fn[name].Constructor = plugin;
    		        $.fn[name].noConflict = () => {
    		          $.fn[name] = JQUERY_NO_CONFLICT;
    		          return plugin.jQueryInterface;
    		        };
    		      }
    		    });
    		  };
    		  const execute = (possibleCallback, args = [], defaultValue = possibleCallback) => {
    		    return typeof possibleCallback === 'function' ? possibleCallback.call(...args) : defaultValue;
    		  };
    		  const executeAfterTransition = (callback, transitionElement, waitForTransition = true) => {
    		    if (!waitForTransition) {
    		      execute(callback);
    		      return;
    		    }
    		    const durationPadding = 5;
    		    const emulatedDuration = getTransitionDurationFromElement(transitionElement) + durationPadding;
    		    let called = false;
    		    const handler = ({
    		      target
    		    }) => {
    		      if (target !== transitionElement) {
    		        return;
    		      }
    		      called = true;
    		      transitionElement.removeEventListener(TRANSITION_END, handler);
    		      execute(callback);
    		    };
    		    transitionElement.addEventListener(TRANSITION_END, handler);
    		    setTimeout(() => {
    		      if (!called) {
    		        triggerTransitionEnd(transitionElement);
    		      }
    		    }, emulatedDuration);
    		  };

    		  /**
    		   * Return the previous/next element of a list.
    		   *
    		   * @param {array} list    The list of elements
    		   * @param activeElement   The active element
    		   * @param shouldGetNext   Choose to get next or previous element
    		   * @param isCycleAllowed
    		   * @return {Element|elem} The proper element
    		   */
    		  const getNextActiveElement = (list, activeElement, shouldGetNext, isCycleAllowed) => {
    		    const listLength = list.length;
    		    let index = list.indexOf(activeElement);

    		    // if the element does not exist in the list return an element
    		    // depending on the direction and if cycle is allowed
    		    if (index === -1) {
    		      return !shouldGetNext && isCycleAllowed ? list[listLength - 1] : list[0];
    		    }
    		    index += shouldGetNext ? 1 : -1;
    		    if (isCycleAllowed) {
    		      index = (index + listLength) % listLength;
    		    }
    		    return list[Math.max(0, Math.min(index, listLength - 1))];
    		  };

    		  exports.defineJQueryPlugin = defineJQueryPlugin;
    		  exports.execute = execute;
    		  exports.executeAfterTransition = executeAfterTransition;
    		  exports.findShadowRoot = findShadowRoot;
    		  exports.getElement = getElement;
    		  exports.getNextActiveElement = getNextActiveElement;
    		  exports.getTransitionDurationFromElement = getTransitionDurationFromElement;
    		  exports.getUID = getUID;
    		  exports.getjQuery = getjQuery;
    		  exports.isDisabled = isDisabled;
    		  exports.isElement = isElement;
    		  exports.isRTL = isRTL;
    		  exports.isVisible = isVisible;
    		  exports.noop = noop;
    		  exports.onDOMContentLoaded = onDOMContentLoaded;
    		  exports.parseSelector = parseSelector;
    		  exports.reflow = reflow;
    		  exports.toType = toType;
    		  exports.triggerTransitionEnd = triggerTransitionEnd;

    		  Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

    		}));
    		
    	} (util, util.exports));
    	return util.exports;
    }

    /*!
      * Bootstrap event-handler.js v5.3.8 (https://getbootstrap.com/)
      * Copyright 2011-2025 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
      * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
      */

    var hasRequiredEventHandler;

    function requireEventHandler () {
    	if (hasRequiredEventHandler) return eventHandler.exports;
    	hasRequiredEventHandler = 1;
    	(function (module, exports) {
    		(function (global, factory) {
    		  module.exports = factory(requireUtil()) ;
    		})(commonjsGlobal, (function (index_js) {
    		  /**
    		   * --------------------------------------------------------------------------
    		   * Bootstrap dom/event-handler.js
    		   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
    		   * --------------------------------------------------------------------------
    		   */


    		  /**
    		   * Constants
    		   */

    		  const namespaceRegex = /[^.]*(?=\..*)\.|.*/;
    		  const stripNameRegex = /\..*/;
    		  const stripUidRegex = /::\d+$/;
    		  const eventRegistry = {}; // Events storage
    		  let uidEvent = 1;
    		  const customEvents = {
    		    mouseenter: 'mouseover',
    		    mouseleave: 'mouseout'
    		  };
    		  const nativeEvents = new Set(['click', 'dblclick', 'mouseup', 'mousedown', 'contextmenu', 'mousewheel', 'DOMMouseScroll', 'mouseover', 'mouseout', 'mousemove', 'selectstart', 'selectend', 'keydown', 'keypress', 'keyup', 'orientationchange', 'touchstart', 'touchmove', 'touchend', 'touchcancel', 'pointerdown', 'pointermove', 'pointerup', 'pointerleave', 'pointercancel', 'gesturestart', 'gesturechange', 'gestureend', 'focus', 'blur', 'change', 'reset', 'select', 'submit', 'focusin', 'focusout', 'load', 'unload', 'beforeunload', 'resize', 'move', 'DOMContentLoaded', 'readystatechange', 'error', 'abort', 'scroll']);

    		  /**
    		   * Private methods
    		   */

    		  function makeEventUid(element, uid) {
    		    return uid && `${uid}::${uidEvent++}` || element.uidEvent || uidEvent++;
    		  }
    		  function getElementEvents(element) {
    		    const uid = makeEventUid(element);
    		    element.uidEvent = uid;
    		    eventRegistry[uid] = eventRegistry[uid] || {};
    		    return eventRegistry[uid];
    		  }
    		  function bootstrapHandler(element, fn) {
    		    return function handler(event) {
    		      hydrateObj(event, {
    		        delegateTarget: element
    		      });
    		      if (handler.oneOff) {
    		        EventHandler.off(element, event.type, fn);
    		      }
    		      return fn.apply(element, [event]);
    		    };
    		  }
    		  function bootstrapDelegationHandler(element, selector, fn) {
    		    return function handler(event) {
    		      const domElements = element.querySelectorAll(selector);
    		      for (let {
    		        target
    		      } = event; target && target !== this; target = target.parentNode) {
    		        for (const domElement of domElements) {
    		          if (domElement !== target) {
    		            continue;
    		          }
    		          hydrateObj(event, {
    		            delegateTarget: target
    		          });
    		          if (handler.oneOff) {
    		            EventHandler.off(element, event.type, selector, fn);
    		          }
    		          return fn.apply(target, [event]);
    		        }
    		      }
    		    };
    		  }
    		  function findHandler(events, callable, delegationSelector = null) {
    		    return Object.values(events).find(event => event.callable === callable && event.delegationSelector === delegationSelector);
    		  }
    		  function normalizeParameters(originalTypeEvent, handler, delegationFunction) {
    		    const isDelegated = typeof handler === 'string';
    		    // TODO: tooltip passes `false` instead of selector, so we need to check
    		    const callable = isDelegated ? delegationFunction : handler || delegationFunction;
    		    let typeEvent = getTypeEvent(originalTypeEvent);
    		    if (!nativeEvents.has(typeEvent)) {
    		      typeEvent = originalTypeEvent;
    		    }
    		    return [isDelegated, callable, typeEvent];
    		  }
    		  function addHandler(element, originalTypeEvent, handler, delegationFunction, oneOff) {
    		    if (typeof originalTypeEvent !== 'string' || !element) {
    		      return;
    		    }
    		    let [isDelegated, callable, typeEvent] = normalizeParameters(originalTypeEvent, handler, delegationFunction);

    		    // in case of mouseenter or mouseleave wrap the handler within a function that checks for its DOM position
    		    // this prevents the handler from being dispatched the same way as mouseover or mouseout does
    		    if (originalTypeEvent in customEvents) {
    		      const wrapFunction = fn => {
    		        return function (event) {
    		          if (!event.relatedTarget || event.relatedTarget !== event.delegateTarget && !event.delegateTarget.contains(event.relatedTarget)) {
    		            return fn.call(this, event);
    		          }
    		        };
    		      };
    		      callable = wrapFunction(callable);
    		    }
    		    const events = getElementEvents(element);
    		    const handlers = events[typeEvent] || (events[typeEvent] = {});
    		    const previousFunction = findHandler(handlers, callable, isDelegated ? handler : null);
    		    if (previousFunction) {
    		      previousFunction.oneOff = previousFunction.oneOff && oneOff;
    		      return;
    		    }
    		    const uid = makeEventUid(callable, originalTypeEvent.replace(namespaceRegex, ''));
    		    const fn = isDelegated ? bootstrapDelegationHandler(element, handler, callable) : bootstrapHandler(element, callable);
    		    fn.delegationSelector = isDelegated ? handler : null;
    		    fn.callable = callable;
    		    fn.oneOff = oneOff;
    		    fn.uidEvent = uid;
    		    handlers[uid] = fn;
    		    element.addEventListener(typeEvent, fn, isDelegated);
    		  }
    		  function removeHandler(element, events, typeEvent, handler, delegationSelector) {
    		    const fn = findHandler(events[typeEvent], handler, delegationSelector);
    		    if (!fn) {
    		      return;
    		    }
    		    element.removeEventListener(typeEvent, fn, Boolean(delegationSelector));
    		    delete events[typeEvent][fn.uidEvent];
    		  }
    		  function removeNamespacedHandlers(element, events, typeEvent, namespace) {
    		    const storeElementEvent = events[typeEvent] || {};
    		    for (const [handlerKey, event] of Object.entries(storeElementEvent)) {
    		      if (handlerKey.includes(namespace)) {
    		        removeHandler(element, events, typeEvent, event.callable, event.delegationSelector);
    		      }
    		    }
    		  }
    		  function getTypeEvent(event) {
    		    // allow to get the native events from namespaced events ('click.bs.button' --> 'click')
    		    event = event.replace(stripNameRegex, '');
    		    return customEvents[event] || event;
    		  }
    		  const EventHandler = {
    		    on(element, event, handler, delegationFunction) {
    		      addHandler(element, event, handler, delegationFunction, false);
    		    },
    		    one(element, event, handler, delegationFunction) {
    		      addHandler(element, event, handler, delegationFunction, true);
    		    },
    		    off(element, originalTypeEvent, handler, delegationFunction) {
    		      if (typeof originalTypeEvent !== 'string' || !element) {
    		        return;
    		      }
    		      const [isDelegated, callable, typeEvent] = normalizeParameters(originalTypeEvent, handler, delegationFunction);
    		      const inNamespace = typeEvent !== originalTypeEvent;
    		      const events = getElementEvents(element);
    		      const storeElementEvent = events[typeEvent] || {};
    		      const isNamespace = originalTypeEvent.startsWith('.');
    		      if (typeof callable !== 'undefined') {
    		        // Simplest case: handler is passed, remove that listener ONLY.
    		        if (!Object.keys(storeElementEvent).length) {
    		          return;
    		        }
    		        removeHandler(element, events, typeEvent, callable, isDelegated ? handler : null);
    		        return;
    		      }
    		      if (isNamespace) {
    		        for (const elementEvent of Object.keys(events)) {
    		          removeNamespacedHandlers(element, events, elementEvent, originalTypeEvent.slice(1));
    		        }
    		      }
    		      for (const [keyHandlers, event] of Object.entries(storeElementEvent)) {
    		        const handlerKey = keyHandlers.replace(stripUidRegex, '');
    		        if (!inNamespace || originalTypeEvent.includes(handlerKey)) {
    		          removeHandler(element, events, typeEvent, event.callable, event.delegationSelector);
    		        }
    		      }
    		    },
    		    trigger(element, event, args) {
    		      if (typeof event !== 'string' || !element) {
    		        return null;
    		      }
    		      const $ = index_js.getjQuery();
    		      const typeEvent = getTypeEvent(event);
    		      const inNamespace = event !== typeEvent;
    		      let jQueryEvent = null;
    		      let bubbles = true;
    		      let nativeDispatch = true;
    		      let defaultPrevented = false;
    		      if (inNamespace && $) {
    		        jQueryEvent = $.Event(event, args);
    		        $(element).trigger(jQueryEvent);
    		        bubbles = !jQueryEvent.isPropagationStopped();
    		        nativeDispatch = !jQueryEvent.isImmediatePropagationStopped();
    		        defaultPrevented = jQueryEvent.isDefaultPrevented();
    		      }
    		      const evt = hydrateObj(new Event(event, {
    		        bubbles,
    		        cancelable: true
    		      }), args);
    		      if (defaultPrevented) {
    		        evt.preventDefault();
    		      }
    		      if (nativeDispatch) {
    		        element.dispatchEvent(evt);
    		      }
    		      if (evt.defaultPrevented && jQueryEvent) {
    		        jQueryEvent.preventDefault();
    		      }
    		      return evt;
    		    }
    		  };
    		  function hydrateObj(obj, meta = {}) {
    		    for (const [key, value] of Object.entries(meta)) {
    		      try {
    		        obj[key] = value;
    		      } catch (_unused) {
    		        Object.defineProperty(obj, key, {
    		          configurable: true,
    		          get() {
    		            return value;
    		          }
    		        });
    		      }
    		    }
    		    return obj;
    		  }

    		  return EventHandler;

    		}));
    		
    	} (eventHandler));
    	return eventHandler.exports;
    }

    var config = {exports: {}};

    var manipulator = {exports: {}};

    /*!
      * Bootstrap manipulator.js v5.3.8 (https://getbootstrap.com/)
      * Copyright 2011-2025 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
      * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
      */

    var hasRequiredManipulator;

    function requireManipulator () {
    	if (hasRequiredManipulator) return manipulator.exports;
    	hasRequiredManipulator = 1;
    	(function (module, exports) {
    		(function (global, factory) {
    		  module.exports = factory() ;
    		})(commonjsGlobal, (function () {
    		  /**
    		   * --------------------------------------------------------------------------
    		   * Bootstrap dom/manipulator.js
    		   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
    		   * --------------------------------------------------------------------------
    		   */

    		  function normalizeData(value) {
    		    if (value === 'true') {
    		      return true;
    		    }
    		    if (value === 'false') {
    		      return false;
    		    }
    		    if (value === Number(value).toString()) {
    		      return Number(value);
    		    }
    		    if (value === '' || value === 'null') {
    		      return null;
    		    }
    		    if (typeof value !== 'string') {
    		      return value;
    		    }
    		    try {
    		      return JSON.parse(decodeURIComponent(value));
    		    } catch (_unused) {
    		      return value;
    		    }
    		  }
    		  function normalizeDataKey(key) {
    		    return key.replace(/[A-Z]/g, chr => `-${chr.toLowerCase()}`);
    		  }
    		  const Manipulator = {
    		    setDataAttribute(element, key, value) {
    		      element.setAttribute(`data-bs-${normalizeDataKey(key)}`, value);
    		    },
    		    removeDataAttribute(element, key) {
    		      element.removeAttribute(`data-bs-${normalizeDataKey(key)}`);
    		    },
    		    getDataAttributes(element) {
    		      if (!element) {
    		        return {};
    		      }
    		      const attributes = {};
    		      const bsKeys = Object.keys(element.dataset).filter(key => key.startsWith('bs') && !key.startsWith('bsConfig'));
    		      for (const key of bsKeys) {
    		        let pureKey = key.replace(/^bs/, '');
    		        pureKey = pureKey.charAt(0).toLowerCase() + pureKey.slice(1);
    		        attributes[pureKey] = normalizeData(element.dataset[key]);
    		      }
    		      return attributes;
    		    },
    		    getDataAttribute(element, key) {
    		      return normalizeData(element.getAttribute(`data-bs-${normalizeDataKey(key)}`));
    		    }
    		  };

    		  return Manipulator;

    		}));
    		
    	} (manipulator));
    	return manipulator.exports;
    }

    /*!
      * Bootstrap config.js v5.3.8 (https://getbootstrap.com/)
      * Copyright 2011-2025 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
      * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
      */

    var hasRequiredConfig;

    function requireConfig () {
    	if (hasRequiredConfig) return config.exports;
    	hasRequiredConfig = 1;
    	(function (module, exports) {
    		(function (global, factory) {
    		  module.exports = factory(requireManipulator(), requireUtil()) ;
    		})(commonjsGlobal, (function (Manipulator, index_js) {
    		  /**
    		   * --------------------------------------------------------------------------
    		   * Bootstrap util/config.js
    		   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
    		   * --------------------------------------------------------------------------
    		   */


    		  /**
    		   * Class definition
    		   */

    		  class Config {
    		    // Getters
    		    static get Default() {
    		      return {};
    		    }
    		    static get DefaultType() {
    		      return {};
    		    }
    		    static get NAME() {
    		      throw new Error('You have to implement the static method "NAME", for each component!');
    		    }
    		    _getConfig(config) {
    		      config = this._mergeConfigObj(config);
    		      config = this._configAfterMerge(config);
    		      this._typeCheckConfig(config);
    		      return config;
    		    }
    		    _configAfterMerge(config) {
    		      return config;
    		    }
    		    _mergeConfigObj(config, element) {
    		      const jsonConfig = index_js.isElement(element) ? Manipulator.getDataAttribute(element, 'config') : {}; // try to parse

    		      return {
    		        ...this.constructor.Default,
    		        ...(typeof jsonConfig === 'object' ? jsonConfig : {}),
    		        ...(index_js.isElement(element) ? Manipulator.getDataAttributes(element) : {}),
    		        ...(typeof config === 'object' ? config : {})
    		      };
    		    }
    		    _typeCheckConfig(config, configTypes = this.constructor.DefaultType) {
    		      for (const [property, expectedTypes] of Object.entries(configTypes)) {
    		        const value = config[property];
    		        const valueType = index_js.isElement(value) ? 'element' : index_js.toType(value);
    		        if (!new RegExp(expectedTypes).test(valueType)) {
    		          throw new TypeError(`${this.constructor.NAME.toUpperCase()}: Option "${property}" provided type "${valueType}" but expected type "${expectedTypes}".`);
    		        }
    		      }
    		    }
    		  }

    		  return Config;

    		}));
    		
    	} (config));
    	return config.exports;
    }

    /*!
      * Bootstrap base-component.js v5.3.8 (https://getbootstrap.com/)
      * Copyright 2011-2025 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
      * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
      */

    var hasRequiredBaseComponent;

    function requireBaseComponent () {
    	if (hasRequiredBaseComponent) return baseComponent.exports;
    	hasRequiredBaseComponent = 1;
    	(function (module, exports) {
    		(function (global, factory) {
    		  module.exports = factory(requireData(), requireEventHandler(), requireConfig(), requireUtil()) ;
    		})(commonjsGlobal, (function (Data, EventHandler, Config, index_js) {
    		  /**
    		   * --------------------------------------------------------------------------
    		   * Bootstrap base-component.js
    		   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
    		   * --------------------------------------------------------------------------
    		   */


    		  /**
    		   * Constants
    		   */

    		  const VERSION = '5.3.8';

    		  /**
    		   * Class definition
    		   */

    		  class BaseComponent extends Config {
    		    constructor(element, config) {
    		      super();
    		      element = index_js.getElement(element);
    		      if (!element) {
    		        return;
    		      }
    		      this._element = element;
    		      this._config = this._getConfig(config);
    		      Data.set(this._element, this.constructor.DATA_KEY, this);
    		    }

    		    // Public
    		    dispose() {
    		      Data.remove(this._element, this.constructor.DATA_KEY);
    		      EventHandler.off(this._element, this.constructor.EVENT_KEY);
    		      for (const propertyName of Object.getOwnPropertyNames(this)) {
    		        this[propertyName] = null;
    		      }
    		    }

    		    // Private
    		    _queueCallback(callback, element, isAnimated = true) {
    		      index_js.executeAfterTransition(callback, element, isAnimated);
    		    }
    		    _getConfig(config) {
    		      config = this._mergeConfigObj(config, this._element);
    		      config = this._configAfterMerge(config);
    		      this._typeCheckConfig(config);
    		      return config;
    		    }

    		    // Static
    		    static getInstance(element) {
    		      return Data.get(index_js.getElement(element), this.DATA_KEY);
    		    }
    		    static getOrCreateInstance(element, config = {}) {
    		      return this.getInstance(element) || new this(element, typeof config === 'object' ? config : null);
    		    }
    		    static get VERSION() {
    		      return VERSION;
    		    }
    		    static get DATA_KEY() {
    		      return `bs.${this.NAME}`;
    		    }
    		    static get EVENT_KEY() {
    		      return `.${this.DATA_KEY}`;
    		    }
    		    static eventName(name) {
    		      return `${name}${this.EVENT_KEY}`;
    		    }
    		  }

    		  return BaseComponent;

    		}));
    		
    	} (baseComponent));
    	return baseComponent.exports;
    }

    var selectorEngine = {exports: {}};

    /*!
      * Bootstrap selector-engine.js v5.3.8 (https://getbootstrap.com/)
      * Copyright 2011-2025 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
      * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
      */

    var hasRequiredSelectorEngine;

    function requireSelectorEngine () {
    	if (hasRequiredSelectorEngine) return selectorEngine.exports;
    	hasRequiredSelectorEngine = 1;
    	(function (module, exports) {
    		(function (global, factory) {
    		  module.exports = factory(requireUtil()) ;
    		})(commonjsGlobal, (function (index_js) {
    		  /**
    		   * --------------------------------------------------------------------------
    		   * Bootstrap dom/selector-engine.js
    		   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
    		   * --------------------------------------------------------------------------
    		   */

    		  const getSelector = element => {
    		    let selector = element.getAttribute('data-bs-target');
    		    if (!selector || selector === '#') {
    		      let hrefAttribute = element.getAttribute('href');

    		      // The only valid content that could double as a selector are IDs or classes,
    		      // so everything starting with `#` or `.`. If a "real" URL is used as the selector,
    		      // `document.querySelector` will rightfully complain it is invalid.
    		      // See https://github.com/twbs/bootstrap/issues/32273
    		      if (!hrefAttribute || !hrefAttribute.includes('#') && !hrefAttribute.startsWith('.')) {
    		        return null;
    		      }

    		      // Just in case some CMS puts out a full URL with the anchor appended
    		      if (hrefAttribute.includes('#') && !hrefAttribute.startsWith('#')) {
    		        hrefAttribute = `#${hrefAttribute.split('#')[1]}`;
    		      }
    		      selector = hrefAttribute && hrefAttribute !== '#' ? hrefAttribute.trim() : null;
    		    }
    		    return selector ? selector.split(',').map(sel => index_js.parseSelector(sel)).join(',') : null;
    		  };
    		  const SelectorEngine = {
    		    find(selector, element = document.documentElement) {
    		      return [].concat(...Element.prototype.querySelectorAll.call(element, selector));
    		    },
    		    findOne(selector, element = document.documentElement) {
    		      return Element.prototype.querySelector.call(element, selector);
    		    },
    		    children(element, selector) {
    		      return [].concat(...element.children).filter(child => child.matches(selector));
    		    },
    		    parents(element, selector) {
    		      const parents = [];
    		      let ancestor = element.parentNode.closest(selector);
    		      while (ancestor) {
    		        parents.push(ancestor);
    		        ancestor = ancestor.parentNode.closest(selector);
    		      }
    		      return parents;
    		    },
    		    prev(element, selector) {
    		      let previous = element.previousElementSibling;
    		      while (previous) {
    		        if (previous.matches(selector)) {
    		          return [previous];
    		        }
    		        previous = previous.previousElementSibling;
    		      }
    		      return [];
    		    },
    		    // TODO: this is now unused; remove later along with prev()
    		    next(element, selector) {
    		      let next = element.nextElementSibling;
    		      while (next) {
    		        if (next.matches(selector)) {
    		          return [next];
    		        }
    		        next = next.nextElementSibling;
    		      }
    		      return [];
    		    },
    		    focusableChildren(element) {
    		      const focusables = ['a', 'button', 'input', 'textarea', 'select', 'details', '[tabindex]', '[contenteditable="true"]'].map(selector => `${selector}:not([tabindex^="-"])`).join(',');
    		      return this.find(focusables, element).filter(el => !index_js.isDisabled(el) && index_js.isVisible(el));
    		    },
    		    getSelectorFromElement(element) {
    		      const selector = getSelector(element);
    		      if (selector) {
    		        return SelectorEngine.findOne(selector) ? selector : null;
    		      }
    		      return null;
    		    },
    		    getElementFromSelector(element) {
    		      const selector = getSelector(element);
    		      return selector ? SelectorEngine.findOne(selector) : null;
    		    },
    		    getMultipleElementsFromSelector(element) {
    		      const selector = getSelector(element);
    		      return selector ? SelectorEngine.find(selector) : [];
    		    }
    		  };

    		  return SelectorEngine;

    		}));
    		
    	} (selectorEngine));
    	return selectorEngine.exports;
    }

    /*!
      * Bootstrap scrollspy.js v5.3.8 (https://getbootstrap.com/)
      * Copyright 2011-2025 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
      * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
      */

    (function (module, exports) {
    	(function (global, factory) {
    	  module.exports = factory(requireBaseComponent(), requireEventHandler(), requireSelectorEngine(), requireUtil()) ;
    	})(commonjsGlobal, (function (BaseComponent, EventHandler, SelectorEngine, index_js) {
    	  /**
    	   * --------------------------------------------------------------------------
    	   * Bootstrap scrollspy.js
    	   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
    	   * --------------------------------------------------------------------------
    	   */


    	  /**
    	   * Constants
    	   */

    	  const NAME = 'scrollspy';
    	  const DATA_KEY = 'bs.scrollspy';
    	  const EVENT_KEY = `.${DATA_KEY}`;
    	  const DATA_API_KEY = '.data-api';
    	  const EVENT_ACTIVATE = `activate${EVENT_KEY}`;
    	  const EVENT_CLICK = `click${EVENT_KEY}`;
    	  const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`;
    	  const CLASS_NAME_DROPDOWN_ITEM = 'dropdown-item';
    	  const CLASS_NAME_ACTIVE = 'active';
    	  const SELECTOR_DATA_SPY = '[data-bs-spy="scroll"]';
    	  const SELECTOR_TARGET_LINKS = '[href]';
    	  const SELECTOR_NAV_LIST_GROUP = '.nav, .list-group';
    	  const SELECTOR_NAV_LINKS = '.nav-link';
    	  const SELECTOR_NAV_ITEMS = '.nav-item';
    	  const SELECTOR_LIST_ITEMS = '.list-group-item';
    	  const SELECTOR_LINK_ITEMS = `${SELECTOR_NAV_LINKS}, ${SELECTOR_NAV_ITEMS} > ${SELECTOR_NAV_LINKS}, ${SELECTOR_LIST_ITEMS}`;
    	  const SELECTOR_DROPDOWN = '.dropdown';
    	  const SELECTOR_DROPDOWN_TOGGLE = '.dropdown-toggle';
    	  const Default = {
    	    offset: null,
    	    // TODO: v6 @deprecated, keep it for backwards compatibility reasons
    	    rootMargin: '0px 0px -25%',
    	    smoothScroll: false,
    	    target: null,
    	    threshold: [0.1, 0.5, 1]
    	  };
    	  const DefaultType = {
    	    offset: '(number|null)',
    	    // TODO v6 @deprecated, keep it for backwards compatibility reasons
    	    rootMargin: 'string',
    	    smoothScroll: 'boolean',
    	    target: 'element',
    	    threshold: 'array'
    	  };

    	  /**
    	   * Class definition
    	   */

    	  class ScrollSpy extends BaseComponent {
    	    constructor(element, config) {
    	      super(element, config);

    	      // this._element is the observablesContainer and config.target the menu links wrapper
    	      this._targetLinks = new Map();
    	      this._observableSections = new Map();
    	      this._rootElement = getComputedStyle(this._element).overflowY === 'visible' ? null : this._element;
    	      this._activeTarget = null;
    	      this._observer = null;
    	      this._previousScrollData = {
    	        visibleEntryTop: 0,
    	        parentScrollTop: 0
    	      };
    	      this.refresh(); // initialize
    	    }

    	    // Getters
    	    static get Default() {
    	      return Default;
    	    }
    	    static get DefaultType() {
    	      return DefaultType;
    	    }
    	    static get NAME() {
    	      return NAME;
    	    }

    	    // Public
    	    refresh() {
    	      this._initializeTargetsAndObservables();
    	      this._maybeEnableSmoothScroll();
    	      if (this._observer) {
    	        this._observer.disconnect();
    	      } else {
    	        this._observer = this._getNewObserver();
    	      }
    	      for (const section of this._observableSections.values()) {
    	        this._observer.observe(section);
    	      }
    	    }
    	    dispose() {
    	      this._observer.disconnect();
    	      super.dispose();
    	    }

    	    // Private
    	    _configAfterMerge(config) {
    	      // TODO: on v6 target should be given explicitly & remove the {target: 'ss-target'} case
    	      config.target = index_js.getElement(config.target) || document.body;

    	      // TODO: v6 Only for backwards compatibility reasons. Use rootMargin only
    	      config.rootMargin = config.offset ? `${config.offset}px 0px -30%` : config.rootMargin;
    	      if (typeof config.threshold === 'string') {
    	        config.threshold = config.threshold.split(',').map(value => Number.parseFloat(value));
    	      }
    	      return config;
    	    }
    	    _maybeEnableSmoothScroll() {
    	      if (!this._config.smoothScroll) {
    	        return;
    	      }

    	      // unregister any previous listeners
    	      EventHandler.off(this._config.target, EVENT_CLICK);
    	      EventHandler.on(this._config.target, EVENT_CLICK, SELECTOR_TARGET_LINKS, event => {
    	        const observableSection = this._observableSections.get(event.target.hash);
    	        if (observableSection) {
    	          event.preventDefault();
    	          const root = this._rootElement || window;
    	          const height = observableSection.offsetTop - this._element.offsetTop;
    	          if (root.scrollTo) {
    	            root.scrollTo({
    	              top: height,
    	              behavior: 'smooth'
    	            });
    	            return;
    	          }

    	          // Chrome 60 doesn't support `scrollTo`
    	          root.scrollTop = height;
    	        }
    	      });
    	    }
    	    _getNewObserver() {
    	      const options = {
    	        root: this._rootElement,
    	        threshold: this._config.threshold,
    	        rootMargin: this._config.rootMargin
    	      };
    	      return new IntersectionObserver(entries => this._observerCallback(entries), options);
    	    }

    	    // The logic of selection
    	    _observerCallback(entries) {
    	      const targetElement = entry => this._targetLinks.get(`#${entry.target.id}`);
    	      const activate = entry => {
    	        this._previousScrollData.visibleEntryTop = entry.target.offsetTop;
    	        this._process(targetElement(entry));
    	      };
    	      const parentScrollTop = (this._rootElement || document.documentElement).scrollTop;
    	      const userScrollsDown = parentScrollTop >= this._previousScrollData.parentScrollTop;
    	      this._previousScrollData.parentScrollTop = parentScrollTop;
    	      for (const entry of entries) {
    	        if (!entry.isIntersecting) {
    	          this._activeTarget = null;
    	          this._clearActiveClass(targetElement(entry));
    	          continue;
    	        }
    	        const entryIsLowerThanPrevious = entry.target.offsetTop >= this._previousScrollData.visibleEntryTop;
    	        // if we are scrolling down, pick the bigger offsetTop
    	        if (userScrollsDown && entryIsLowerThanPrevious) {
    	          activate(entry);
    	          // if parent isn't scrolled, let's keep the first visible item, breaking the iteration
    	          if (!parentScrollTop) {
    	            return;
    	          }
    	          continue;
    	        }

    	        // if we are scrolling up, pick the smallest offsetTop
    	        if (!userScrollsDown && !entryIsLowerThanPrevious) {
    	          activate(entry);
    	        }
    	      }
    	    }
    	    _initializeTargetsAndObservables() {
    	      this._targetLinks = new Map();
    	      this._observableSections = new Map();
    	      const targetLinks = SelectorEngine.find(SELECTOR_TARGET_LINKS, this._config.target);
    	      for (const anchor of targetLinks) {
    	        // ensure that the anchor has an id and is not disabled
    	        if (!anchor.hash || index_js.isDisabled(anchor)) {
    	          continue;
    	        }
    	        const observableSection = SelectorEngine.findOne(decodeURI(anchor.hash), this._element);

    	        // ensure that the observableSection exists & is visible
    	        if (index_js.isVisible(observableSection)) {
    	          this._targetLinks.set(decodeURI(anchor.hash), anchor);
    	          this._observableSections.set(anchor.hash, observableSection);
    	        }
    	      }
    	    }
    	    _process(target) {
    	      if (this._activeTarget === target) {
    	        return;
    	      }
    	      this._clearActiveClass(this._config.target);
    	      this._activeTarget = target;
    	      target.classList.add(CLASS_NAME_ACTIVE);
    	      this._activateParents(target);
    	      EventHandler.trigger(this._element, EVENT_ACTIVATE, {
    	        relatedTarget: target
    	      });
    	    }
    	    _activateParents(target) {
    	      // Activate dropdown parents
    	      if (target.classList.contains(CLASS_NAME_DROPDOWN_ITEM)) {
    	        SelectorEngine.findOne(SELECTOR_DROPDOWN_TOGGLE, target.closest(SELECTOR_DROPDOWN)).classList.add(CLASS_NAME_ACTIVE);
    	        return;
    	      }
    	      for (const listGroup of SelectorEngine.parents(target, SELECTOR_NAV_LIST_GROUP)) {
    	        // Set triggered links parents as active
    	        // With both <ul> and <nav> markup a parent is the previous sibling of any nav ancestor
    	        for (const item of SelectorEngine.prev(listGroup, SELECTOR_LINK_ITEMS)) {
    	          item.classList.add(CLASS_NAME_ACTIVE);
    	        }
    	      }
    	    }
    	    _clearActiveClass(parent) {
    	      parent.classList.remove(CLASS_NAME_ACTIVE);
    	      const activeNodes = SelectorEngine.find(`${SELECTOR_TARGET_LINKS}.${CLASS_NAME_ACTIVE}`, parent);
    	      for (const node of activeNodes) {
    	        node.classList.remove(CLASS_NAME_ACTIVE);
    	      }
    	    }

    	    // Static
    	    static jQueryInterface(config) {
    	      return this.each(function () {
    	        const data = ScrollSpy.getOrCreateInstance(this, config);
    	        if (typeof config !== 'string') {
    	          return;
    	        }
    	        if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
    	          throw new TypeError(`No method named "${config}"`);
    	        }
    	        data[config]();
    	      });
    	    }
    	  }

    	  /**
    	   * Data API implementation
    	   */

    	  EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
    	    for (const spy of SelectorEngine.find(SELECTOR_DATA_SPY)) {
    	      ScrollSpy.getOrCreateInstance(spy);
    	    }
    	  });

    	  /**
    	   * jQuery
    	   */

    	  index_js.defineJQueryPlugin(ScrollSpy);

    	  return ScrollSpy;

    	}));
    	
    } (scrollspy));

    var scrollspyExports = scrollspy.exports;
    var ScrollSpy = /*@__PURE__*/getDefaultExportFromCjs(scrollspyExports);

    /* src/Views/Modulo2.svelte generated by Svelte v3.59.2 */
    const file$6 = "src/Views/Modulo2.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    function get_each_context_1$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (33:6) {#each paginas as pagina,i}
    function create_each_block_1$3(ctx) {
    	let a;
    	let t0_value = /*pagina*/ ctx[2].titulo + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(a, "class", "list-group-item list-group-item-action");
    			attr_dev(a, "href", "#list-item-" + /*i*/ ctx[4]);
    			add_location(a, file$6, 33, 8, 983);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t0);
    			append_dev(a, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$3.name,
    		type: "each",
    		source: "(33:6) {#each paginas as pagina,i}",
    		ctx
    	});

    	return block;
    }

    // (50:6) {#each paginas as pagina,i }
    function create_each_block$5(ctx) {
    	let pagina;
    	let current;

    	pagina = new Pagina({
    			props: {
    				titulo: /*pagina*/ ctx[2].titulo,
    				texto: /*pagina*/ ctx[2].texto,
    				imagenes: /*pagina*/ ctx[2].imagenes,
    				indice: /*i*/ ctx[4],
    				id: "list-item-" + /*i*/ ctx[4],
    				audio: "modulo2/" + /*pagina*/ ctx[2].audio
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(pagina.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(pagina, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pagina.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pagina.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(pagina, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(50:6) {#each paginas as pagina,i }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let navbar;
    	let t0;
    	let div4;
    	let div1;
    	let div0;
    	let h1;
    	let t2;
    	let t3;
    	let div3;
    	let div2;
    	let t4;
    	let crearqr;
    	let t5;
    	let creditos;
    	let current;
    	navbar = new NavBar({ $$inline: true });
    	let each_value_1 = paginas$6;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$3(get_each_context_1$3(ctx, each_value_1, i));
    	}

    	let each_value = paginas$6;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	crearqr = new CrearQR({
    			props: {
    				url: "https://www.youtube.com/watch?v=DiRY0K5BYLs&pp=ygUnaW5haCB0diBlc3RhZG8gZGUgZ3VlcnJlcm8gcHJlaGlzcGFuaWNv"
    			},
    			$$inline: true
    		});

    	creditos = new Creditos({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			div4 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "MÓDULO 2 - DESARROLLOS CULTURALES ANTIGUOS";
    			t2 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t3 = space();
    			div3 = element("div");
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			create_component(crearqr.$$.fragment);
    			t5 = space();
    			create_component(creditos.$$.fragment);
    			add_location(h1, file$6, 31, 6, 889);
    			attr_dev(div0, "id", "list-example");
    			attr_dev(div0, "class", "list-group sticky-top");
    			add_location(div0, file$6, 29, 4, 825);
    			attr_dev(div1, "class", "col-4");
    			add_location(div1, file$6, 28, 2, 801);
    			attr_dev(div2, "data-bs-spy", "scroll");
    			attr_dev(div2, "data-bs-target", "#list-example");
    			attr_dev(div2, "data-bs-smooth-scroll", "true");
    			attr_dev(div2, "class", "scrollspy-example svelte-cd8qvh");
    			add_location(div2, file$6, 43, 4, 1177);
    			attr_dev(div3, "class", "col-8");
    			add_location(div3, file$6, 42, 2, 1153);
    			attr_dev(div4, "class", "row");
    			add_location(div4, file$6, 27, 0, 781);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t2);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(div0, null);
    				}
    			}

    			append_dev(div4, t3);
    			append_dev(div4, div3);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div2, null);
    				}
    			}

    			/*div2_binding*/ ctx[1](div2);
    			insert_dev(target, t4, anchor);
    			mount_component(crearqr, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(creditos, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*paginas*/ 0) {
    				each_value_1 = paginas$6;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$3(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$3(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*paginas*/ 0) {
    				each_value = paginas$6;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div2, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(crearqr.$$.fragment, local);
    			transition_in(creditos.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(crearqr.$$.fragment, local);
    			transition_out(creditos.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div4);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			/*div2_binding*/ ctx[1](null);
    			if (detaching) detach_dev(t4);
    			destroy_component(crearqr, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(creditos, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Modulo2', slots, []);
    	let scrollContainer;

    	onMount(() => {
    		if (scrollContainer) {
    			// Si ya había una instancia, destruye primero
    			ScrollSpy.getInstance(scrollContainer)?.dispose();

    			// Crea una nueva instancia
    			new ScrollSpy(scrollContainer,
    			{
    					target: "#list-example",
    					smoothScroll: true,
    					offset: 120
    				});
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Modulo2> was created with unknown prop '${key}'`);
    	});

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			scrollContainer = $$value;
    			$$invalidate(0, scrollContainer);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		Pagina,
    		paginas: paginas$6,
    		NavBar,
    		CrearQR,
    		ScrollSpy,
    		Creditos,
    		scrollContainer
    	});

    	$$self.$inject_state = $$props => {
    		if ('scrollContainer' in $$props) $$invalidate(0, scrollContainer = $$props.scrollContainer);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [scrollContainer, div2_binding];
    }

    class Modulo2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modulo2",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    var paginas$5 = [
    	{
    		titulo: "EL CLÁSICO: UN HIATO EN GUERRERO",
    		texto: "Existe un gran\nvacío en el conocimiento de lo\nque ocurrió en Guerrero\ndurante el llamado Clásico\nTemprano (200 y 650 d.C.), tal\nvez por falta de investigación, o\nquizá por un fenómeno que\npropició que la producción\narquitectónica se suspendiera.\nUna posible explicación es que\nen ese lapso alcanzó su\napogeo una de las más grandes\nciudades\nen\nel\norbe:\nTeotihuacán, cuyo poder y\ndominio se extendió a territorio\nguerrerense absorbiendo sus\nrecursos y mano de obra.",
    		imagenes: [
    			"modulo3/1.png",
    			"modulo3/2.png",
    			"modulo3/3.png"
    		],
    		audio: "1.mp3",
    		url: "www.google.com"
    	},
    	{
    		titulo: "OBJETOS DE ESTILO TEOTIHUACANO EN GUERRERO",
    		texto: "El objeto\nde\nestilo\nteotihuacano más extraordinario que\nprocede de Guerrero es la máscara\nencontrada cerca de Malinaltepec en la\nregión de La Montaña. Todavía\nconserva gran parte del mosaico de\namazonita y turquesa sobre el rostro,\nconcha nácar en los ojos y concha de\ncaracol rojo para formar las cejas y un\ndiseño serpentino sobre las mejillas.\nEn\nLa\nOrganera-\nXochipala se excavaron fragmentos de\nuna máscara de piedra verde, una\ncabecita de barro y restos de cerámica\nque indican contactos con Teotihuacán.\nYa que este sitio surgió después de la\ncaída de la magna urbe, es posible\ndeducir que fueron llevados como\nreliquias\nreliquias.\nInvestigaciones\nen\nproceso en la Costa Grande sugieren\nuna\nmayor\ninteracción\ncon\nTeotihuacán, pues gran parte de las\nvasijas de barro ahí localizadas imitan\nformas\ny\nacabados\nde\nestilo\nteotihuacano, como son los vasos y\ncajetes trípodes y los soportes de\nbraseros teatro.",
    		imagenes: [
    			"modulo3/4.png",
    			"modulo3/5.png",
    			"modulo3/6.png",
    			"modulo3/7.png",
    			"modulo3/8.png"
    		],
    		audio: "2.mp3",
    		url: "www.google.com"
    	}
    ];

    /* src/Views/Modulo3.svelte generated by Svelte v3.59.2 */
    const file$5 = "src/Views/Modulo3.svelte";

    function create_fragment$6(ctx) {
    	let navbar;
    	let t0;
    	let h1;
    	let t2;
    	let creditos;
    	let t3;
    	let button0;
    	let t4_value = paginas$5[0].titulo + "";
    	let t4;
    	let t5;
    	let img0;
    	let img0_src_value;
    	let t6;
    	let div5;
    	let div0;
    	let button1;
    	let t7;
    	let div4;
    	let div3;
    	let div1;
    	let pagina0;
    	let t8;
    	let div2;
    	let crearqr0;
    	let t9;
    	let button2;
    	let t10_value = paginas$5[1].titulo + "";
    	let t10;
    	let t11;
    	let img1;
    	let img1_src_value;
    	let t12;
    	let div11;
    	let div6;
    	let button3;
    	let t13;
    	let div10;
    	let div9;
    	let div7;
    	let pagina1;
    	let t14;
    	let div8;
    	let crearqr1;
    	let current;
    	navbar = new NavBar({ $$inline: true });
    	creditos = new Creditos({ $$inline: true });

    	pagina0 = new Pagina({
    			props: {
    				titulo: paginas$5[0].titulo,
    				texto: paginas$5[0].texto,
    				imagenes: paginas$5[0].imagenes,
    				indice: 1,
    				id: 1,
    				audio: "modulo3/" + paginas$5[0].audio,
    				link: paginas$5[0].url
    			},
    			$$inline: true
    		});

    	crearqr0 = new CrearQR({
    			props: {
    				url: "https://www.youtube.com/watch?v=T3EVat7H2kU&pp=ygUnaW5haCB0diBlc3RhZG8gZGUgZ3VlcnJlcm8gcHJlaGlzcGFuaWNv"
    			},
    			$$inline: true
    		});

    	pagina1 = new Pagina({
    			props: {
    				titulo: paginas$5[1].titulo,
    				texto: paginas$5[1].texto,
    				imagenes: paginas$5[1].imagenes,
    				indice: 2,
    				id: 2,
    				audio: "modulo3/" + paginas$5[1].audio,
    				link: paginas$5[1].url
    			},
    			$$inline: true
    		});

    	crearqr1 = new CrearQR({
    			props: {
    				url: "https://www.youtube.com/watch?v=6ztDrv063Ro"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "MÓDULO 3 - EL CLÁSICO";
    			t2 = space();
    			create_component(creditos.$$.fragment);
    			t3 = space();
    			button0 = element("button");
    			t4 = text(t4_value);
    			t5 = space();
    			img0 = element("img");
    			t6 = space();
    			div5 = element("div");
    			div0 = element("div");
    			button1 = element("button");
    			t7 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			create_component(pagina0.$$.fragment);
    			t8 = space();
    			div2 = element("div");
    			create_component(crearqr0.$$.fragment);
    			t9 = space();
    			button2 = element("button");
    			t10 = text(t10_value);
    			t11 = space();
    			img1 = element("img");
    			t12 = space();
    			div11 = element("div");
    			div6 = element("div");
    			button3 = element("button");
    			t13 = space();
    			div10 = element("div");
    			div9 = element("div");
    			div7 = element("div");
    			create_component(pagina1.$$.fragment);
    			t14 = space();
    			div8 = element("div");
    			create_component(crearqr1.$$.fragment);
    			add_location(h1, file$5, 8, 0, 297);
    			if (!src_url_equal(img0.src, img0_src_value = "images/modulo3/1.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "modulo 3 imagen 1");
    			attr_dev(img0, "height", "388");
    			attr_dev(img0, "width", "auto");
    			add_location(img0, file$5, 11, 2, 505);
    			attr_dev(button0, "class", "btn btn-primary");
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "data-bs-toggle", "offcanvas");
    			attr_dev(button0, "data-bs-target", "#offcanvasTop");
    			attr_dev(button0, "aria-controls", "offcanvasTop");
    			add_location(button0, file$5, 10, 0, 350);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "btn-close");
    			attr_dev(button1, "data-bs-dismiss", "offcanvas");
    			attr_dev(button1, "aria-label", "Close");
    			add_location(button1, file$5, 16, 4, 748);
    			attr_dev(div0, "class", "offcanvas-header");
    			add_location(div0, file$5, 15, 2, 713);
    			attr_dev(div1, "class", "col");
    			add_location(div1, file$5, 20, 6, 915);
    			attr_dev(div2, "class", "col");
    			add_location(div2, file$5, 22, 6, 1134);
    			attr_dev(div3, "class", "row");
    			add_location(div3, file$5, 19, 4, 891);
    			attr_dev(div4, "class", "offcanvas-body ");
    			add_location(div4, file$5, 18, 2, 856);
    			attr_dev(div5, "class", "offcanvas offcanvas-top h-100");
    			attr_dev(div5, "tabindex", "-1");
    			attr_dev(div5, "id", "offcanvasTop");
    			attr_dev(div5, "aria-labelledby", "offcanvasTopLabel");
    			add_location(div5, file$5, 14, 0, 599);
    			if (!src_url_equal(img1.src, img1_src_value = "images/modulo3/4.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "modulo 3 imagen 1");
    			add_location(img1, file$5, 28, 0, 1476);
    			attr_dev(button2, "class", "btn btn-primary");
    			attr_dev(button2, "type", "button");
    			attr_dev(button2, "data-bs-toggle", "offcanvas");
    			attr_dev(button2, "data-bs-target", "#offcanvasBottom");
    			attr_dev(button2, "aria-controls", "offcanvasBottom");
    			add_location(button2, file$5, 27, 0, 1317);
    			attr_dev(button3, "type", "button");
    			attr_dev(button3, "class", "btn-close");
    			attr_dev(button3, "data-bs-dismiss", "offcanvas");
    			attr_dev(button3, "aria-label", "Close");
    			add_location(button3, file$5, 33, 4, 1702);
    			attr_dev(div6, "class", "offcanvas-header");
    			add_location(div6, file$5, 32, 2, 1667);
    			attr_dev(div7, "class", "col");
    			add_location(div7, file$5, 37, 6, 1867);
    			attr_dev(div8, "class", "col");
    			add_location(div8, file$5, 39, 6, 2088);
    			attr_dev(div9, "class", "row");
    			add_location(div9, file$5, 36, 4, 1843);
    			attr_dev(div10, "class", "offcanvas-body");
    			add_location(div10, file$5, 35, 2, 1810);
    			attr_dev(div11, "class", "offcanvas offcanvas-bottom h-100");
    			attr_dev(div11, "tabindex", "-1");
    			attr_dev(div11, "id", "offcanvasBottom");
    			attr_dev(div11, "aria-labelledby", "offcanvasBottomLabel");
    			add_location(div11, file$5, 31, 0, 1544);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(creditos, target, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, button0, anchor);
    			append_dev(button0, t4);
    			append_dev(button0, t5);
    			append_dev(button0, img0);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div0);
    			append_dev(div0, button1);
    			append_dev(div5, t7);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			mount_component(pagina0, div1, null);
    			append_dev(div3, t8);
    			append_dev(div3, div2);
    			mount_component(crearqr0, div2, null);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, button2, anchor);
    			append_dev(button2, t10);
    			append_dev(button2, t11);
    			append_dev(button2, img1);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, div11, anchor);
    			append_dev(div11, div6);
    			append_dev(div6, button3);
    			append_dev(div11, t13);
    			append_dev(div11, div10);
    			append_dev(div10, div9);
    			append_dev(div9, div7);
    			mount_component(pagina1, div7, null);
    			append_dev(div9, t14);
    			append_dev(div9, div8);
    			mount_component(crearqr1, div8, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(creditos.$$.fragment, local);
    			transition_in(pagina0.$$.fragment, local);
    			transition_in(crearqr0.$$.fragment, local);
    			transition_in(pagina1.$$.fragment, local);
    			transition_in(crearqr1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(creditos.$$.fragment, local);
    			transition_out(pagina0.$$.fragment, local);
    			transition_out(crearqr0.$$.fragment, local);
    			transition_out(pagina1.$$.fragment, local);
    			transition_out(crearqr1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t2);
    			destroy_component(creditos, detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div5);
    			destroy_component(pagina0);
    			destroy_component(crearqr0);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(button2);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(div11);
    			destroy_component(pagina1);
    			destroy_component(crearqr1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Modulo3', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Modulo3> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Creditos,
    		NavBar,
    		Pagina,
    		paginas: paginas$5,
    		CrearQR
    	});

    	return [];
    }

    class Modulo3 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modulo3",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    var paginas$4 = [
    	{
    		titulo: "EL EPICLÁSICO O CLÁSICO TARDÍO Y TERMINAL",
    		texto: "Al corto horizonte que siguió la caída de Teotihuacán se le conoce como **Epiclásico** (650/700-900/1000 d. C.) y equivale al Clásico Tardío y Terminal de algunas regiones de Mesoamérica. Es entonces cuando florecen numerosos sitios como Cacaxtla en Tlaxcala, Cantona en Puebla, Xochicalco en Morelos, San Miguel Ixtapan en el Estado de México, Tajín en Veracruz y muchos sitios en la zona maya y en Guerrero. Este auge se logró, sobre todo en el Altiplano y en Guerrero, cuando los pobladores pudieron expresarse con sus propios estilos arquitectónicos, escultóricos, pictóricos o cerámicos al desembarazarse de la enorme presión que debió ejercer Teotihuacán, por eso se habla de una **regionalización de la cultura**.",
    		imagenes: [
    			"modulo4/1.png"
    		],
    		audio: "1.mp3",
    		url: "www.google.com"
    	},
    	{
    		titulo: "EL APOGEO DE LA CULTURA MEZCALA",
    		texto: "A la caída de Teotihuacán, en el Epiclásico (650/700-900/1000 d.C.), hubo un **apogeo cultural en la región Mezcala**, que abarca cerca de 24,000 km². Entonces surgieron varias decenas de sitios con arquitectura de piedra, estratégicamente ubicados en las cimas de las montañas; las cerámicas locales predominaron y la escultura portátil de estilo Mezcala persistió como un estilo regional vigoroso junto con otros estilos transicionales, como el Teotihuacán-Guerrero. Los sitios mejor investigados son San Miguel Ixtapan en el Estado de México y La Organera-Xochipala en Guerrero, cuyo estudio fue el punto de partida y el eje sobre el que se pudo determinar la región y cultura Mezcala, que se desarrolló en gran parte del Norte, del Centro, la Sierra Madre del Sur y la Tierra Caliente de Guerrero, así como en porciones de los estados limítrofes de Michoacán, México, Morelos y Puebla.",
    		imagenes: [
    			"modulo4/2.png"
    		],
    		audio: "2.mp3",
    		url: "www.google.com"
    	},
    	{
    		titulo: "LA LOCALIDAD DE XOCHIPALA",
    		texto: "Ya que en Guerrero hay pocos terrenos planos, y éstos se destinaron preferentemente para labores agrícolas, muchos de los asentamientos urbanos se construyeron en los filos de las montañas. Varios de ellos, aunque dispersos, funcionaron de manera simultánea realizando actividades complementarias, religiosas, administrativas, de habitación y de defensa o vigilancia, formando así una **\"ciudad discontinua\"**, como en la localidad de Xochipala. Un asentamiento urbano o ciudad se caracteriza por haber sido planificado y por tener infraestructura. Su construcción implica un trabajo colectivo organizado bajo el mando de una clase dirigente. Ahí vivieron los líderes políticos, administradores, sacerdotes y artesanos; también ahí se almacenaban los productos que comerciaban o redistribuían entre la población.",
    		imagenes: [
    			"modulo4/3.png"
    		],
    		audio: "3.mp3",
    		url: "www.google.com"
    	},
    	{
    		titulo: "LA ORGANERA-XOCHIPALA",
    		texto: "Un asentamiento urbano representativo de la cultura Mezcala en el Epiclásico es La Organera-Xochipala, ubicado en el municipio de Eduardo Neri (antes Zumpango del Río), sobre una de las estribaciones que bajan de la Sierra Madre del Sur. Ya que fue construido en la cúspide de una montaña, hubo que modificar la inclinada ladera mediante cortes y rellenos artificiales para crear **terrazas planas en varios niveles**, a las que se dotó con depósitos para almacenar y distribuir agua y una red de drenajes ocultos. Los edificios se levantaron en medio de las terrazas o alrededor de plazas y patios, comunicados por pasillos y escaleras. La Organera-Xochipala abarca cerca de 11 hectáreas y formó parte de la \"ciudad discontinua\" de la localidad de Xochipala, que cubre cerca de 80 kilómetros cuadrados.",
    		imagenes: [
    			"modulo4/4.png"
    		],
    		audio: "4.mp3",
    		url: "www.google.com"
    	},
    	{
    		titulo: "GÉNEROS ARQUITECTÓNICOS",
    		texto: "En La Organera-Xochipala destacan tres géneros arquitectónicos que se replican en la región Mezcala: los edificios con **bóveda falsa**, los basamentos para templos con muros en **talud-tablero** decorados con hileras de piezas circulares conocidas como **\"clavos\"** y los **palacios porticados** con pilares en la fachada y techos planos. Estos últimos se reproducen con gran maestría en las maquetas arquitectónicas de estilo Mezcala.",
    		imagenes: [
    			"modulo4/5.png",
    			"modulo4/6.png"
    		],
    		audio: "5.mp3",
    		url: "www.google.com"
    	},
    	{
    		titulo: "ADORNOS Y FIGURILLAS DE PIEDRA VERDE",
    		texto: "En **piedra verde** se elaboraron numerosas cuentas de collar, pero sin duda uno de los hallazgos más significativos en La Organera-Xochipala fue el haber encontrado *in situ* cinco pequeñas **esculturas de estilo Mezcala** en clara asociación con edificios del Epiclásico, edad corroborada con doce fechas de radiocarbono.",
    		imagenes: [
    			"modulo4/7.png",
    			"modulo4/8.png"
    		],
    		audio: "6.mp3",
    		url: "www.google.com"
    	},
    	{
    		titulo: "RECURSOS ALIMENTICIOS VEGETALES: MAZORCAS",
    		texto: "Los restos de **mazorcas de maíz** fueron excepcionalmente abundantes y se preservaron en excelentes condiciones debido a que estaban quemadas. En el análisis de una muestra de más de 500 mazorcas se lograron identificar diversas variedades, tres de ellas las más numerosas: **Tabloncillo, Zapalote chico y Bolita**, todas derivadas de linajes centro o sudamericanos.",
    		imagenes: [
    			"modulo4/9.png",
    			"modulo4/10.png",
    			"modulo4/11.png",
    			"modulo4/12.png"
    		],
    		audio: "7.mp3",
    		url: "www.google.com"
    	},
    	{
    		titulo: "COCULA",
    		texto: "En el área de **Cocula**, situada 15 km al suroeste de Iguala se localizaron 95 sitios que fueron ocupados a lo largo de toda la época prehispánica. En uno de los más tempranos se localizó una tumba troncocónica. Los edificios del Epiclásico fueron construidos con piedra, se situaron alrededor de plazas y patios y tuvieron muros y pisos cubiertos con estuco, a veces pintados de rojo. En el sitio \"El Panteón\" se descubrió un temascal, y en \"El Mirador\" dos figurillas de estilo Mezcala. Varios sitios dominan visualmente el entorno y ahí se recuperaron entierros humanos con ofrendas de cerámica, figurillas y máscaras de estilo Mezcala.",
    		imagenes: [
    			"modulo4/13.png",
    			"modulo4/14.png",
    			"modulo4/15.png",
    			"modulo4/16.png",
    			"modulo4/17.png"
    		],
    		audio: "8.mp3",
    		url: "www.google.com"
    	}
    ];

    /* src/Views/Modulo4.svelte generated by Svelte v3.59.2 */
    const file$4 = "src/Views/Modulo4.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (15:6) {#each paginas as pagina, i}
    function create_each_block_1$2(ctx) {
    	let button;
    	let t0_value = /*pagina*/ ctx[2].titulo + "";
    	let t0;
    	let t1;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[1](/*i*/ ctx[4]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(button, "class", button_class_value = "nav-link " + (/*activeIndex*/ ctx[0] === /*i*/ ctx[4] ? 'active' : ''));
    			add_location(button, file$4, 15, 8, 601);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t0);
    			append_dev(button, t1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*activeIndex*/ 1 && button_class_value !== (button_class_value = "nav-link " + (/*activeIndex*/ ctx[0] === /*i*/ ctx[4] ? 'active' : ''))) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(15:6) {#each paginas as pagina, i}",
    		ctx
    	});

    	return block;
    }

    // (30:6) {#if activeIndex === i}
    function create_if_block$1(ctx) {
    	let div;
    	let pagina;
    	let t;
    	let current;

    	pagina = new Pagina({
    			props: {
    				titulo: /*pagina*/ ctx[2].titulo,
    				texto: /*pagina*/ ctx[2].texto,
    				imagenes: /*pagina*/ ctx[2].imagenes,
    				audio: "modulo4/" + /*pagina*/ ctx[2].audio
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(pagina.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "fade show svelte-tbftsw");
    			add_location(div, file$4, 31, 8, 1069);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(pagina, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pagina.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pagina.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(pagina);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(30:6) {#if activeIndex === i}",
    		ctx
    	});

    	return block;
    }

    // (29:4) {#each paginas as pagina, i}
    function create_each_block$4(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*activeIndex*/ ctx[0] === /*i*/ ctx[4] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*activeIndex*/ ctx[0] === /*i*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*activeIndex*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(29:4) {#each paginas as pagina, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let navbar;
    	let t0;
    	let div3;
    	let div1;
    	let h1;
    	let t2;
    	let div0;
    	let t3;
    	let crearqr;
    	let t4;
    	let div2;
    	let t5;
    	let creditos;
    	let current;
    	navbar = new NavBar({ $$inline: true });
    	let each_value_1 = paginas$4;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	crearqr = new CrearQR({
    			props: {
    				url: "https://mediateca.inah.gob.mx/islandora_74/islandora/object/articulo:17619"
    			},
    			$$inline: true
    		});

    	let each_value = paginas$4;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	creditos = new Creditos({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			div3 = element("div");
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "MÓDULO 4 - EL EPICLÁSICO";
    			t2 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t3 = space();
    			create_component(crearqr.$$.fragment);
    			t4 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			create_component(creditos.$$.fragment);
    			attr_dev(h1, "class", "mb-3");
    			add_location(h1, file$4, 12, 4, 467);
    			attr_dev(div0, "class", "nav flex-column nav-pills");
    			add_location(div0, file$4, 13, 4, 518);
    			attr_dev(div1, "class", "col-3 border-end vh-100 overflow-auto");
    			add_location(div1, file$4, 11, 2, 411);
    			attr_dev(div2, "class", "col-9 p-3");
    			add_location(div2, file$4, 27, 2, 942);
    			attr_dev(div3, "class", "row");
    			add_location(div3, file$4, 9, 0, 350);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t2);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(div0, null);
    				}
    			}

    			append_dev(div1, t3);
    			mount_component(crearqr, div1, null);
    			append_dev(div3, t4);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div2, null);
    				}
    			}

    			insert_dev(target, t5, anchor);
    			mount_component(creditos, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*activeIndex, paginas*/ 1) {
    				each_value_1 = paginas$4;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*paginas, activeIndex*/ 1) {
    				each_value = paginas$4;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div2, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(crearqr.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(creditos.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(crearqr.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(creditos.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks_1, detaching);
    			destroy_component(crearqr);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(creditos, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Modulo4', slots, []);
    	let activeIndex = 0; // índice de la página activa
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Modulo4> was created with unknown prop '${key}'`);
    	});

    	const click_handler = i => $$invalidate(0, activeIndex = i);

    	$$self.$capture_state = () => ({
    		Pagina,
    		paginas: paginas$4,
    		NavBar,
    		Creditos,
    		CrearQR,
    		activeIndex
    	});

    	$$self.$inject_state = $$props => {
    		if ('activeIndex' in $$props) $$invalidate(0, activeIndex = $$props.activeIndex);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [activeIndex, click_handler];
    }

    class Modulo4 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modulo4",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    var paginas$3 = [
    	{
    		titulo: "EL POSCLÁSICO (GENERALIDADES Y TARDÍO INICIO)",
    		texto: "Al periodo que comprende los últimos 500 años previos de la llegada de los españoles se le conoce como Posclásico. La parte temprana del Posclásico en Guerrero se sitúa antes de la conquista mexica, es decir antes de 1400 d. C. Por falta de investigación se conocen pocos sitios arqueológicos que pertenezcan con seguridad a este periodo.\n\nEl Posclásico Tardío (1400-1521 d. C.) se conoce más por las fuentes escritas del siglo XVI y posteriores que por los trabajos arqueológicos. Entre los sitios que se atribuyen a este periodo está Ixcateopan, un asentamiento con claras relaciones con el grupo mexica, y otros que sobresalen porque fueron utilizados como fortalezas por los mexicas al enfrentarse con los ejércitos tarascos, como el de Oztuma, ubicado en la cúspide de la montaña del mismo nombre en el actual municipio de Teloloapan, que cuenta con una serie de fosos y murallas que lo rodean para facilitar su defensa.",
    		imagenes: [
    			"modulo5/1.png"
    		],
    		audio: "1.mp3",
    		url: "www.google.com"
    	},
    	{
    		titulo: "EL POSCLÁSICO TEMPRANO",
    		texto: "El Posclásico Temprano (900/1000-1400 d.C.) es una etapa aún poco conocida. Al iniciar este periodo la mayoría de los sitios de la región Mezcala con arquitectura monumental fueron abandonados, quizá por la entrada de grupos ajenos a la región, como se deduce por la presencia de cerámicas pintadas, llamadas genéricamente \"matlatzincas\" o \"tlahuicas\", que conviven con las locales, entre las que destaca la \"Yestla Naranjo\". También hay algunos monumentos labrados de la Tierra Caliente que se podrían atribuir a este periodo, como la estela de La Palmita en Ajuchitlán. Algunos de los sitios que probablemente fueron habitados durante el Posclásico Temprano son: Pezuapa, localizado en Chilpancingo, Los Tepoltzis, cerca de Tixtla, Huamuxtitlán y Texmelincan, en La Montaña, y otros localizados en la Tierra Caliente.",
    		imagenes: [
    			"modulo5/2.png",
    			"modulo5/3.png",
    			"modulo5/4.png",
    			"modulo5/5.png"
    		],
    		audio: "2.mp3",
    		url: "www.google.com"
    	},
    	{
    		titulo: "EL POSCLÁSICO TARDÍO. LA CONQUISTA MEXICA",
    		texto: "Por los escritos del siglo XVI se sabe que en poco más de 100 años las incursiones mexicas lograron someter todo el territorio guerrerense, a excepción de la zona Yope y gran parte de la cuenca del Balsas Medio, a la que se designó como la \"tierra de nadie\", la que amortiguaba el impacto del otro poderoso reino de esos tiempos, el tarasco. La conquista mexica inició después de 1400 d. C., cuando gobernaba Izcóatl en su capital, México-Tenochtitlan, y continuó hasta 1520 d. C. cuando lo hacía Moctezuma Xocoyotzin. A Cuauhtémoc, su último gobernante o \"Tlatoani\" lo sorprendió la Conquista española.",
    		imagenes: [
    			"modulo5/6.png",
    			"modulo5/7.png",
    			"modulo5/8.png"
    		],
    		audio: "3.mp3",
    		url: "www.google.com"
    	},
    	{
    		titulo: "EL TRIBUTO GUERRERENSE",
    		texto: "Por la Matrícula de Tributos y otras fuentes se sabe que los mexicas estaban sumamente interesados en ciertos productos manufacturados en Guerrero, como las mantas de algodón, los trajes para guerreros y sus escudos, los sartales de cuentas de piedra verde y los adornos y laminillas de cobre y oro, así como en sus recursos naturales y cultivados: el maíz, el cacao, la miel y la cera, el algodón, el copal y las conchas y caracoles, los que periódicamente tributaban controlados tierra adentro por la Provincia de Tepecoacuilco, y en la costa por la de Cihuatlán. Las máscaras, cabezas y figurillas de estilo Mezcala escasamente aparecen en las listas de tributos por lo que se supone fueron saqueadas por las huestes mexicas para tributarlas en su templo principal, el Templo Mayor de Tenochtitlan, donde se han excavado más de 400 de ellas.",
    		imagenes: [
    			"modulo5/9.png",
    			"modulo5/10.png",
    			"modulo5/11.png",
    			"modulo5/12.png"
    		],
    		audio: "4.mp3",
    		url: "www.google.com"
    	}
    ];

    /* src/Views/Modulo5.svelte generated by Svelte v3.59.2 */
    const file$3 = "src/Views/Modulo5.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	child_ctx[2] = i;
    	return child_ctx;
    }

    // (11:2) {#each paginas as pagina, i}
    function create_each_block$3(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let pagina;
    	let t;
    	let current;

    	pagina = new Pagina({
    			props: {
    				titulo: /*pagina*/ ctx[0].titulo,
    				texto: /*pagina*/ ctx[0].texto,
    				imagenes: /*pagina*/ ctx[0].imagenes,
    				id: "idm5" + /*i*/ ctx[2],
    				indice: "indicem5" + /*i*/ ctx[2],
    				audio: "modulo5/" + /*pagina*/ ctx[0].audio
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			create_component(pagina.$$.fragment);
    			t = space();
    			attr_dev(div0, "class", "card-body");
    			add_location(div0, file$3, 13, 8, 493);
    			attr_dev(div1, "class", "card h-100");
    			add_location(div1, file$3, 12, 6, 460);
    			attr_dev(div2, "class", "col-md-6 mb-4");
    			add_location(div2, file$3, 11, 4, 426);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			mount_component(pagina, div0, null);
    			append_dev(div2, t);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pagina.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pagina.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(pagina);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(11:2) {#each paginas as pagina, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let navbar;
    	let t0;
    	let h1;
    	let t2;
    	let div0;
    	let t3;
    	let div3;
    	let div1;
    	let crearqr;
    	let t4;
    	let div2;
    	let creditos;
    	let current;

    	navbar = new NavBar({
    			props: { arreglo: "fixed-top" },
    			$$inline: true
    		});

    	let each_value = paginas$3;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	crearqr = new CrearQR({
    			props: {
    				url: "https://www.youtube.com/watch?v=J_XM-XXYb5A&pp=ygUbaW5haCB0diBpeGNhdGVvcGFuIGd1ZXJyZXJv0gcJCU0KAYcqIYzv"
    			},
    			$$inline: true
    		});

    	creditos = new Creditos({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "MÓDULO 5 - ÚLTIMOS ASENTAMIENTOS PREHISPÁNICOS";
    			t2 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			div3 = element("div");
    			div1 = element("div");
    			create_component(crearqr.$$.fragment);
    			t4 = space();
    			div2 = element("div");
    			create_component(creditos.$$.fragment);
    			add_location(h1, file$3, 8, 0, 317);
    			attr_dev(div0, "class", "row");
    			add_location(div0, file$3, 9, 0, 373);
    			attr_dev(div1, "class", "col");
    			add_location(div1, file$3, 23, 2, 767);
    			attr_dev(div2, "class", "col");
    			add_location(div2, file$3, 24, 2, 922);
    			attr_dev(div3, "class", "row");
    			add_location(div3, file$3, 22, 0, 747);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div0, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div0, null);
    				}
    			}

    			insert_dev(target, t3, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			mount_component(crearqr, div1, null);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			mount_component(creditos, div2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*paginas*/ 0) {
    				each_value = paginas$3;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(crearqr.$$.fragment, local);
    			transition_in(creditos.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(crearqr.$$.fragment, local);
    			transition_out(creditos.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);
    			destroy_component(crearqr);
    			destroy_component(creditos);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Modulo5', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Modulo5> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Creditos,
    		NavBar,
    		Pagina,
    		paginas: paginas$3,
    		CrearQR
    	});

    	return [];
    }

    class Modulo5 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modulo5",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    var paginas$2 = [
    	{
    		titulo: "ÉPOCA DE CONTACTO",
    		texto: "A la llegada de los españoles, Guerrero era un rico mosaico de pueblos y lenguas, reflejo de lo que fue en época prehispánica. Gracias a los documentos pictográficos, como los códices, lienzos y mapas, así como por los documentos puramente escritos, se sabe que entonces había entre 27 y 31 grupos étnicos distintos que hablaban diferentes lenguas. Aunque se conoce que el cuitlateco fue una de las lenguas más importantes ya desapareció, al igual que la mayoría, pues sólo han sobrevivido cuatro: el mixteco, el tlapaneco y el amuzgo en la región de La Montaña, y el náhuatl en varias partes de Guerrero. También por esos documentos se puede saber cómo vivían, qué productos cultivaban, cómo vestían y que herramientas y artesanías fabricaban, cómo eran sus casas, cómo se organizaban socialmente y cuál era su forma de gobierno, qué dioses veneraban y cuál era el territorio que ocupaban. Es de resaltar que un mismo grupo étnico-lingüístico no necesariamente ocupaba un territorio continuo, sino que estaba \"entreverado\" con otros, a manera de pequeñas islas.",
    		imagenes: [
    			"modulo6/1.png"
    		],
    		audio: "1.mp3",
    		url: "www.google.com"
    	},
    	{
    		titulo: "CONTINUIDAD CULTURAL",
    		texto: "Los actuales pueblos indígenas de Guerrero conservan costumbres y tradiciones heredadas de época prehispánica, como en sus rituales agrícolas y los dedicados para investir a sus autoridades comunales. En estos rituales se utilizan los \"manojos contados\" y los \"paquetes\" o \"bultos sagrados\", en los que frecuentemente se colocan esculturas prehispánicas o \"San Marquitos\", y los tamales elaborados con amaranto, que figuran deidades y cerros, todos ellos representados en códices y ligados con la fertilidad, la lluvia y la agricultura. Otro elemento de relación se da entre el jaguar, que se podría remontar a la época olmeca, y los rituales y danzas dedicados igualmente a propiciar la fertilidad y la agricultura. Estudios recientes señalan también el gran parecido entre las ofrendas sacrificiales registradas arqueológicamente en el Templo Mayor de Tenochtitlan y las de grupos indígenas contemporáneos de Guerrero, que se asemejan tanto en los materiales usados como en la secuencia al colocar sus ofrendas. En ambos casos se distinguen tres niveles: el inframundo o \"asiento\", el terrestre y el celeste.",
    		imagenes: [
    			"modulo6/2.png",
    			"modulo6/3.png",
    			"modulo6/4.png",
    			"modulo6/5.png",
    			"modulo6/6.png",
    			"modulo6/7.png"
    		],
    		audio: "2.mp3",
    		url: "www.google.com"
    	}
    ];

    /* src/Views/Modulo6.svelte generated by Svelte v3.59.2 */
    const file$2 = "src/Views/Modulo6.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    // (22:6) {#each items as item, i}
    function create_each_block_1$1(ctx) {
    	let button;

    	let t0_value = (/*item*/ ctx[3].type === "pagina"
    	? /*item*/ ctx[3].data.titulo
    	: /*item*/ ctx[3].titulo) + "";

    	let t0;
    	let t1;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[2](/*i*/ ctx[5]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(button, "class", button_class_value = "nav-link " + (/*activeIndex*/ ctx[0] === /*i*/ ctx[5] ? 'active' : ''));
    			add_location(button, file$2, 22, 8, 770);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t0);
    			append_dev(button, t1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*activeIndex*/ 1 && button_class_value !== (button_class_value = "nav-link " + (/*activeIndex*/ ctx[0] === /*i*/ ctx[5] ? 'active' : ''))) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(22:6) {#each items as item, i}",
    		ctx
    	});

    	return block;
    }

    // (37:6) {#if activeIndex === i}
    function create_if_block(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let current;
    	const if_block_creators = [create_if_block_1, create_if_block_2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*item*/ ctx[3].type === "pagina") return 0;
    		if (/*item*/ ctx[3].type === "imagen") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			attr_dev(div, "class", "fade show svelte-1xsmllx");
    			add_location(div, file$2, 37, 8, 1268);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div, null);
    			}

    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (if_block) if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(37:6) {#if activeIndex === i}",
    		ctx
    	});

    	return block;
    }

    // (44:43) 
    function create_if_block_2(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*item*/ ctx[3].src)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*item*/ ctx[3].titulo);
    			attr_dev(img, "class", "img-fluid");
    			add_location(img, file$2, 44, 12, 1566);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(44:43) ",
    		ctx
    	});

    	return block;
    }

    // (39:10) {#if item.type === "pagina"}
    function create_if_block_1(ctx) {
    	let pagina;
    	let current;

    	pagina = new Pagina({
    			props: {
    				titulo: /*item*/ ctx[3].data.titulo,
    				texto: /*item*/ ctx[3].data.texto,
    				imagenes: /*item*/ ctx[3].data.imagenes,
    				audio: "modulo6/" + /*item*/ ctx[3].data.audio
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(pagina.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(pagina, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pagina.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pagina.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(pagina, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(39:10) {#if item.type === \\\"pagina\\\"}",
    		ctx
    	});

    	return block;
    }

    // (36:4) {#each items as item, i}
    function create_each_block$2(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*activeIndex*/ ctx[0] === /*i*/ ctx[5] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*activeIndex*/ ctx[0] === /*i*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*activeIndex*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(36:4) {#each items as item, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let navbar;
    	let t0;
    	let div3;
    	let div1;
    	let h1;
    	let t2;
    	let div0;
    	let t3;
    	let crearqr;
    	let t4;
    	let creditos;
    	let t5;
    	let div2;
    	let current;
    	navbar = new NavBar({ $$inline: true });
    	let each_value_1 = /*items*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	crearqr = new CrearQR({
    			props: {
    				url: "https://www.youtube.com/watch?v=DiRY0K5BYLs&pp=ygUeaW5haCB0diBwb3NjbGFzaWNvIGVuIGd1ZXJyZXJv"
    			},
    			$$inline: true
    		});

    	creditos = new Creditos({ $$inline: true });
    	let each_value = /*items*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			div3 = element("div");
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "MÓDULO 6 - ÉPOCA DE CONTACTO";
    			t2 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t3 = space();
    			create_component(crearqr.$$.fragment);
    			t4 = space();
    			create_component(creditos.$$.fragment);
    			t5 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h1, file$2, 19, 4, 649);
    			attr_dev(div0, "class", "nav flex-column nav-pills");
    			add_location(div0, file$2, 20, 4, 691);
    			attr_dev(div1, "class", "col-3 border-end");
    			add_location(div1, file$2, 18, 2, 614);
    			attr_dev(div2, "class", "col-9 p-3");
    			add_location(div2, file$2, 34, 2, 1177);
    			attr_dev(div3, "class", "row");
    			add_location(div3, file$2, 16, 0, 564);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t2);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(div0, null);
    				}
    			}

    			append_dev(div1, t3);
    			mount_component(crearqr, div1, null);
    			append_dev(div1, t4);
    			mount_component(creditos, div1, null);
    			append_dev(div3, t5);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div2, null);
    				}
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*activeIndex, items*/ 3) {
    				each_value_1 = /*items*/ ctx[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*items, activeIndex*/ 3) {
    				each_value = /*items*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div2, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(crearqr.$$.fragment, local);
    			transition_in(creditos.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(crearqr.$$.fragment, local);
    			transition_out(creditos.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks_1, detaching);
    			destroy_component(crearqr);
    			destroy_component(creditos);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Modulo6', slots, []);
    	let activeIndex = 0;

    	// Construimos un arreglo que incluye las dos páginas y la tercera imagen
    	const items = [
    		...paginas$2.map(p => ({ type: "pagina", data: p })),
    		{
    			type: "imagen",
    			src: "images/modulo6/10.png",
    			titulo: "LA OFRENDA SACRIFICIAL"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Modulo6> was created with unknown prop '${key}'`);
    	});

    	const click_handler = i => $$invalidate(0, activeIndex = i);

    	$$self.$capture_state = () => ({
    		Creditos,
    		NavBar,
    		Pagina,
    		paginas: paginas$2,
    		CrearQR,
    		activeIndex,
    		items
    	});

    	$$self.$inject_state = $$props => {
    		if ('activeIndex' in $$props) $$invalidate(0, activeIndex = $$props.activeIndex);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [activeIndex, items, click_handler];
    }

    class Modulo6 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modulo6",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    var paginas$1 = [
    	{
    		id: "m7item-1",
    		titulo: "DESARROLLOS LOCALES",
    		texto: "En las diferentes regiones de Guerrero se han localizado hasta ahora cerca de 3000 sitios arqueológicos; unos cuantos han sido investigados, pero otros sólo los conocemos porque se ha registrado su presencia, o por piezas y fragmentos que proceden de hallazgos fortuitos y de saqueo. De tal manera las colecciones de museos y privadas se surtieron de algunos de los objetos más variados que se decía procedían de diversas regiones, los que al compararlos con piezas recobradas arqueológicamente dentro y fuera del territorio guerrerense, nos permiten conocer con cierta seguridad a qué cultura arqueológica y edad corresponden. Ciertos rasgos de la cerámica, figurillas, escultura y arquitectura permiten también establecer contactos con áreas y culturas cercanas o lejanas, rasgos siempre minoritarios respecto a las manifestaciones locales.",
    		imagenes: [
    			"modulo7/1.png"
    		],
    		audio: "1.mp3",
    		url: "www.google.com",
    		mostrar: false
    	},
    	{
    		id: "m7item-2",
    		titulo: "LA REGIÓN NORTE",
    		texto: "Sobre la región Norte se cuenta con importantes datos históricos y etnohistóricos que se refieren principalmente al proceso de conquista llevado a cabo por los mexicas; pero la región estuvo poblada muchos siglos antes de estos acontecimientos. En esta región se han llevado a cabo investigaciones arqueológicas a diferente profundidad en asentamientos de gran antigüedad, de época pre-olmeca y olmeca como el de Atopula, cerca de Huitzuco; de varios sitios del Preclásico Superior, como Cuetlajuchitlán; del Posclásico Tardío, como Ixcateopan y Oztuma, y de áreas que abarcan toda la ocupación prehispánica como la comprendida entre Iguala y Acapetlahuaya, la de Buenavista y a lo largo del río Tepecoacuilco. Típicas de esta región son las vasijas o molcajetes trípodes pintados en rojo sobre crema y ciertas figurillas y máscaras de piedra con narices exageradas, que los coleccionistas llamaron de \"estilo chontal\".",
    		imagenes: [
    			"modulo7/2.png",
    			"modulo7/3.png",
    			"modulo7/4.png",
    			"modulo7/5.png",
    			"modulo7/6.png",
    			"modulo7/7.png"
    		],
    		audio: "2.mp3",
    		url: "www.google.com",
    		mostrar: false
    	},
    	{
    		id: "m7item-2-1",
    		titulo: "IXCATEOPAN",
    		texto: "Esta zona arqueológica, cuyo nombre en náhuatl significa \"en el templo del algodón\", se encuentra en el municipio de Ixcateopan de Cuauhtémoc. Por las evidencias hasta ahora descubiertas se sabe que fue ocupada en el último periodo prehispánico, lo que permite conocerla no sólo por la arqueología sino también por las referencias escritas. La distribución y forma de sus edificios sugiere que ahí se realizaron ceremonias religiosas, funciones administrativas y de almacenamiento, donde se llevaban a cabo actividades de transformación, de redistribución de productos y de intercambio comercial. La presencia de alfarería local, principalmente en forma de molcajetes trípodes decorados en rojo o marrón sobre crema, o pintados en negro y rojo sobre crema, y su asociación a vasijas que imitan a las llamadas Azteca III, Rojo Texcoco y Cholula Policromo, indican que tuvo una estrecha relación con el centro de México. Según las fuentes escritas se dice que Ixcateopan estuvo habitado por los matlame o matlatzincas, por los coixcas o cohuixcas, que hablaban una variante del náhuatl, o por el grupo chontal, del que muy poco se sabe, y que una vez conquistado por los mexica se convirtió en su aliado para combatir a los tarascos y pasó a formar parte de la provincia tributaria de Tepecoacuilco.",
    		imagenes: [
    			"modulo7/8.png",
    			"modulo7/9.png",
    			"modulo7/10.png",
    			"modulo7/11.png"
    		],
    		audio: "3.mp3",
    		url: "https://mediateca.inah.gob.mx/islandora_74/islandora/object/articulo:16092",
    		mostrar: true
    	},
    	{
    		id: "m7item-3",
    		titulo: "LA MONTAÑA",
    		texto: "La Montaña de Guerrero es una de las áreas más ricas en vestigios arqueológicos que abarcan toda la época prehispánica. Se sabe de piezas o fragmentos de figurillas y vasijas de estilo olmeca, de época pre-olmeca, y también de figurillas y cerámica que muestran relaciones con la cuenca de México. Sitios como Huamuxtitlán, Zoyatlán de Juárez, Alacatlatzala y Tenango, son de las pocas zonas arqueológicas conocidas. Es en La Montaña donde se encuentra la famosa gruta de Oxtotitlán con pinturas rupestres de estilo olmeca, y el gran sitio de Zitlala que, por su ubicación, pudo haber servido como una de las fortalezas tarascas.",
    		imagenes: [
    			"modulo7/12.png",
    			"modulo7/13.png",
    			"modulo7/14.png",
    			"modulo7/15.png"
    		],
    		audio: "4.mp3",
    		url: "https://www.youtube.com/watch?v=HkiOHhPBARw&pp=ygUhIGluYWggdHYgcmVnaW9uIG1vbnRhw7FhIGd1ZXJyZXJv",
    		mostrar: true
    	},
    	{
    		id: "m7item-4",
    		titulo: "TEHUALCALCO",
    		texto: "Tehuacalco se ubica a escasos 10 km de Tierra Colorada. Esta zona arqueológica fue construida en la cúspide de una montaña que se acondicionó artificialmente. El asentamiento principal se extiende por 12 hectáreas y, aunque su investigación está en proceso, se supone que fue habitada entre el Epiclásico y el Posclásico Temprano. En su arquitectura masiva destaca el estilo peculiar del recubrimiento de sus muros, a base de lápidas lisas y verticales rodeadas por pequeñas lajas horizontales, conocido como \"paramento mixteco\", sistema sumamente útil para minimizar su destrucción cuando tiembla. Unas cuantas lajas están labradas con diversos motivos. Sobre una pequeña elevación natural está el edificio más alto al que se accede por amplios espacios escalonados intercalados con rampas. Al sur se encuentra un gran Juego de Pelota rematado con cabezales en ambos extremos, donde sus paredes están remetidas a manera de porterías. Más al sur se levanta una amplia plataforma donde se ubica el área habitacional, con cuartos que rodean patios hundidos y un sistema de canales de desagüe.",
    		imagenes: [
    			"modulo7/16.png",
    			"modulo7/17.png",
    			"modulo7/18.png",
    			"modulo7/19.png",
    			"modulo7/20.png",
    			"modulo7/21.png"
    		],
    		audio: "5.mp3",
    		url: "https://www.youtube.com/watch?v=trUUstG9HYI&pp=ygUSdGVodWFjYWxjbyBpbmFoIHR2",
    		mostrar: true
    	},
    	{
    		id: "m7item-5",
    		titulo: "TIERRA CALIENTE",
    		texto: "Se sabe de pocos sitios prehispánicos en la Tierra Caliente, donde predomina la cultura conocida como Teotihuacán-Guerrero. Muy recientemente se localizó un sitio que viene a llenar parte del vacío en el conocimiento del Clásico guerrerense. En El Puerto de Allende, municipio de Tlalchapa se registraron esculturas, vasijas, figurillas y restos de arquitectura de estilo teotihuacano, que en conjunto pueden representar un \"enclave\" de la poderosa ciudad. Recordemos que la Tierra Caliente, \"la tierra de nadie\", no fue conquistada por los mexicas.",
    		imagenes: [
    			"modulo7/22.png",
    			"modulo7/23.png",
    			"modulo7/24.png",
    			"modulo7/25.png"
    		],
    		audio: "6.mp3",
    		url: "https://www.youtube.com/watch?v=TrDHOH2l90M&pp=ygUgaW5haCB0diB0aWVycmEgY2FsaWVudGUgZ3VlcnJlcm8%3D",
    		mostrar: true
    	},
    	{
    		id: "m7item-5-1",
    		titulo: "UN HALLAZGO EXTRAORDINARIO",
    		texto: "¿Sabían que a principios del siglo XX se hizo un hallazgo extraordinario en la Tierra Caliente? A orillas del Arroyo de Vizcaíno, afluente del Río del Oro, se excavó un sepulcro en el que se encontraron restos humanos y numerosos objetos de piedra y concha delimitados con cuatro lápidas, dos de ellas labradas con asombrosos diseños de personajes fantásticos, los que fueron relacionados con estilos sudamericanos. Entre los objetos encontrados sobresalen una cabeza de piedra con restos de mosaico y una ofrenda de 17 figurillas de piedra verde, una de ellas de estilo Mezcala.",
    		imagenes: [
    			"modulo7/26.png",
    			"modulo7/27.png",
    			"modulo7/28.png",
    			"modulo7/29.png"
    		],
    		audio: "7.mp3",
    		url: "www.google.com",
    		mostrar: false
    	},
    	{
    		id: "m7item-6",
    		titulo: "REGIÓN ACAPULCO",
    		texto: "En Puerto Marqués se ha documentado la transición del Periodo Arcaico al Preclásico, hace aproximadamente 5000 años, cuando se formaron paulatinamente las primeras aldeas.\nEn ese tiempo, en la Bahía de Acapulco se comenzó a elaborar la alfarería, siendo en Playa Majahua el lugar con la cerámica más temprana de Mesoamérica.\nDesde el Arcaico, se tallaron pozuelos en bloques de piedra en Cerro Tambuco, Revolcadero, La Roqueta y Los Manantiales en Punta Diamante, los cuales se empleaban para moler granos, pero también con implicación ritual.\nMás tarde, se realizaron petrograbados en sitios como Caleta y Caletilla, El Coloso y Puerto Marqués, mostrando cuentas calendáricas, escenas míticas, animales marinos y figuras antropomorfas, entre otros, destacando Palma Sola y La Sabana por la cantidad de motivos grabados.\nExistió una fuerte influencia de la Costa Grande y de culturas como la olmeca y la teotihuacana, y entre el siglo II y IX surgió y alcanzó su apogeo La Sabana, como centro regional que poseía arquitectura monumental.\nAl final de la época prehispánica, Acapulco formó parte del territorio de los yopes.",
    		imagenes: [
    			"modulo7/1.jpeg",
    			"modulo7/2.jpeg",
    			"modulo7/3.jpeg",
    			"modulo7/4.jpeg",
    			"modulo7/5.jpeg",
    			"modulo7/6.jpeg",
    			"modulo7/7.jpeg",
    			"modulo7/8.jpeg",
    			"modulo7/9.jpeg"
    		],
    		audio: "acapulco.mp3",
    		url: "https://www.youtube.com/watch?v=8POuG0PXXjY&pp=ygUSaW5haCB0diBwYWxtYSBzb2xh",
    		mostrar: true
    	},
    	{
    		id: "m7item-6-1",
    		titulo: "PALMA SOLA",
    		texto: "Palma Sola se encuentra en la ladera sur del cerro El Veladero en la bahía de Acapulco. Aunque este sitio no fue habitado, sobresale por las esquemáticas figuras grabadas sobre 18 rocas. En ellas se plasmaron motivos con formas humanas, de la fauna marina, de cuentas calendáricas y de la geografía del lugar. La mayoría de las figuras humanas están en actitud estática y no llevan vestimenta ni atuendos, y en numerosas ocasiones están unidas por líneas que se han interpretado como personas emparentadas, relacionadas con algún ancestro o con diferentes grupos sociales. Otras, que parecerían estar en movimiento, sugieren su participación en festividades o ritos, y unas cuantas, con penachos, bastones de mando y otros atributos se conectan con sacerdotes o chamanes. En la roca llamada Elemento 1, protegida por una saliente rocosa y bajo la cual escurre agua, hay una figura con rasgos de jaguar, que simboliza la lluvia y la fertilidad.",
    		imagenes: [
    			"modulo7/34.png",
    			"modulo7/35.png",
    			"modulo7/36.png",
    			"modulo7/37.png",
    			"modulo7/38.png",
    			"modulo7/39.png"
    		],
    		audio: "9.mp3",
    		url: "https://www.youtube.com/watch?v=lMHalspL6js&pp=ygUSdGVodWFjYWxjbyBpbmFoIHR2",
    		mostrar: true
    	},
    	{
    		id: "m7item-7",
    		titulo: "LA COSTA GRANDE",
    		texto: "En la Costa Grande se desarrolló una cultura muy distinta a las del interior de Guerrero, pues ahí no hay sitios con arquitectura de piedra, sino que se conforman con montículos levantados con tierra, cantos rodados y conchas sobre los que se colocaron construcciones perecederas; estos montículos se distribuyen alrededor de espacios abiertos a manera de plazas y patios. La cerámica, y sobre todo las figurillas de barro modeladas a mano en diversos y bellos estilos locales son excepcionalmente abundantes y se fechan en el Preclásico y el Clásico cuando, a diferencia del interior, hubo un florecimiento cultural.",
    		imagenes: [
    			"modulo7/30.png",
    			"modulo7/31.png",
    			"modulo7/32.png",
    			"modulo7/33.png"
    		],
    		audio: "8.mp3",
    		url: "www.google.com",
    		mostrar: false
    	},
    	{
    		id: "m7item-7-1",
    		titulo: "COAHUAYUTLA",
    		texto: "Alejado de la franja costera, en el actual municipio de Coahuayutla, se han hallado piezas extraordinarias que posiblemente formen parte de una cultura distinta a las conocidas en Guerrero. Al norte de este municipio, allá por los años sesenta del siglo pasado, se efectuó un importante salvamento arqueológico cuando se construyó la Presa El Infiernillo en los límites de Guerrero con Michoacán. Entonces se localizaron más de 100 sitios arqueológicos, casi 300 entierros humanos, la mayoría con ofrendas de vasijas, numerosos artefactos de piedra, de metal y de concha, así como poco más de 40 pequeños metates para moler pigmentos, a los que se les llama \"paletas de pintura\".",
    		imagenes: [
    			"modulo7/40.png",
    			"modulo7/41.png",
    			"modulo7/42.png",
    			"modulo7/43.png"
    		],
    		audio: "10.mp3",
    		url: "www.google.com",
    		mostrar: false
    	},
    	{
    		id: "m7item-7-2",
    		titulo: "“PALETAS DE PINTURA”",
    		texto: "Los metates para moler pigmentos, a los que se les llama \"paletas de pintura\", fueron tallados en rocas duras, en forma rectangular y circular, con patas o sin ellas. La gran mayoría son lisos, pero otros están bellamente labrados con rasgos de animales como el lagarto, el camaleón, el murciélago y la nutria, o bien con rasgos humanos estilizados. Si el auge de las “paletas de pintura” se dio en el Clásico, cabría preguntarse ¿quiénes serían los consumidores de esos pigmentos? Una cuestión sorprendente es que estos pequeños morteros son muy parecidos a los de la lejana cultura Hohokam del suroeste de los Estados Unidos, con la que también comparten la semejanza de las pulseras de concha.",
    		imagenes: [
    			"modulo7/44.png",
    			"modulo7/45.png",
    			"modulo7/46.png",
    			"modulo7/47.png"
    		],
    		audio: "11.mp3",
    		url: "www.google.com",
    		mostrar: false
    	},
    	{
    		id: "m7item-8",
    		titulo: "REGIÓN COSTA CHICA",
    		texto: "En la Costa Chica se han recobrado fragmentos de figurillas y vasijas de estilo olmeca que atestiguan su temprana ocupación. Actualmente se están registrando numerosos y extensos sitios de diversa temporalidad. En el sitio de Piedra Labrada, municipio de Ometepec, se han reportado más de 40 estructuras construidas con piedra sobre grandes plataformas, entre ellas cinco Juegos de Pelota y abundantes estelas y esculturas bellamente esculpidas. Aunque su investigación está en proceso, es posible que el sitio Piedra Labrada haya tenido su auge en el Posclásico.",
    		imagenes: [
    			"modulo7/48.png",
    			"modulo7/49.png",
    			"modulo7/50.png",
    			"modulo7/51.png",
    			"modulo7/52.png",
    			"modulo7/53.png"
    		],
    		audio: "12.mp3",
    		url: "www.google.com",
    		mostrar: false
    	},
    	{
    		id: "m7item-9",
    		titulo: "REGIÓN SIERRA",
    		texto: "Esta región fue habitada desde tiempos olmecas, posee presencia de la Cultura Mezcala y una estrecha relación con regiones vecinas. También tiene particularidades como el desarrollo de la metalurgia y la abundancia de lugares con pintura rupestre y petrograbados, como son los sitios de la sierra de Atoyac, con figuras de más de cuatro metros que poseen temática mitológica y de culto agrícola.\nPor su parte, en el área de El Naranjo, Yextla y Corral de Piedra existió un grupo en el Posclásico Temprano que desarrolló rasgos únicos como la producción de la cerámica \"Yestla-El Naranjo\", y la disposición de ofrendas mortuorias compuestas de vasijas, cuentas de concha, sellos planos y piezas de cobre.\nMientras que, en el área de Tlacotepec, se presentan cajetes con borde rojo.\n\nOtra característica es la importancia de las cuevas, algunas se usaron como espacios funerarios, mientras que en otras se hicieron rituales de fertilidad con ofrendas que incluyen espejos de piedra negra, aros de piedra o concha insertados en estalagmitas, brazaletes de concha con deidades grabadas y vasijas.",
    		imagenes: [
    			"modulo7/sierra1.jpeg",
    			"modulo7/sierra2.jpeg",
    			"modulo7/sierra3.jpeg",
    			"modulo7/sierra4.jpeg",
    			"modulo7/sierra5.jpeg",
    			"modulo7/sierra6.jpeg",
    			"modulo7/sierra7.jpeg",
    			"modulo7/sierra8.jpeg"
    		],
    		audio: "sierra.mp3",
    		url: "www.google.com",
    		mostrar: false
    	}
    ];

    /* src/Views/Modulo7.svelte generated by Svelte v3.59.2 */
    const file$1 = "src/Views/Modulo7.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (49:10) {#each enlace.direcciones as direccion}
    function create_each_block_2(ctx) {
    	let a;
    	let t_value = /*direccion*/ ctx[8].titulo + "";
    	let t;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "class", "nav-link ms-3 my-1");
    			attr_dev(a, "href", /*direccion*/ ctx[8].enlace);
    			add_location(a, file$1, 49, 14, 2153);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(49:10) {#each enlace.direcciones as direccion}",
    		ctx
    	});

    	return block;
    }

    // (44:8) {#each enlaces as enlace,i}
    function create_each_block_1(ctx) {
    	let a;
    	let t0_value = /*enlace*/ ctx[6].titulo + "";
    	let t0;
    	let t1;
    	let nav;
    	let t2;
    	let each_value_2 = /*enlace*/ ctx[6].direcciones;
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			nav = element("nav");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			attr_dev(a, "class", "nav-link");
    			attr_dev(a, "href", /*enlace*/ ctx[6].direccion);
    			add_location(a, file$1, 44, 10, 1951);
    			attr_dev(nav, "class", "nav nav-pills flex-column");
    			add_location(nav, file$1, 47, 10, 2049);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, nav, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(nav, null);
    				}
    			}

    			append_dev(nav, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*enlaces*/ 2) {
    				each_value_2 = /*enlace*/ ctx[6].direcciones;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(nav, t2);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(nav);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(44:8) {#each enlaces as enlace,i}",
    		ctx
    	});

    	return block;
    }

    // (65:6) {#each paginas as pagina,i}
    function create_each_block$1(ctx) {
    	let div;
    	let pagina;
    	let t;
    	let current;

    	pagina = new Pagina({
    			props: {
    				titulo: /*pagina*/ ctx[3].titulo,
    				texto: /*pagina*/ ctx[3].texto,
    				imagenes: /*pagina*/ ctx[3].imagenes,
    				indice: /*i*/ ctx[5],
    				id: /*pagina*/ ctx[3].id,
    				audio: "modulo7/" + /*pagina*/ ctx[3].audio,
    				mostrar: /*pagina*/ ctx[3].mostrar,
    				link: /*pagina*/ ctx[3].url
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(pagina.$$.fragment);
    			t = space();
    			add_location(div, file$1, 65, 8, 2553);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(pagina, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pagina.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pagina.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(pagina);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(65:6) {#each paginas as pagina,i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div3;
    	let div0;
    	let nav1;
    	let navbar;
    	let t0;
    	let h1;
    	let t2;
    	let nav0;
    	let t3;
    	let div2;
    	let div1;
    	let t4;
    	let creditos;
    	let current;
    	navbar = new NavBar({ $$inline: true });
    	let each_value_1 = /*enlaces*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = paginas$1;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	creditos = new Creditos({ $$inline: true });

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			nav1 = element("nav");
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "MÓDULO 7 - DESARROLLOS LOCALES";
    			t2 = space();
    			nav0 = element("nav");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t3 = space();
    			div2 = element("div");
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			create_component(creditos.$$.fragment);
    			add_location(h1, file$1, 41, 6, 1819);
    			attr_dev(nav0, "class", "nav nav-pills flex-column");
    			add_location(nav0, file$1, 42, 6, 1865);
    			attr_dev(nav1, "id", "navbar-m7");
    			attr_dev(nav1, "class", "nav flex-column position-sticky top-0");
    			add_location(nav1, file$1, 39, 4, 1722);
    			attr_dev(div0, "class", "col-4");
    			add_location(div0, file$1, 38, 2, 1698);
    			attr_dev(div1, "data-bs-spy", "scroll");
    			attr_dev(div1, "data-bs-target", "#navbar-m7");
    			attr_dev(div1, "data-bs-smooth-scroll", "true");
    			attr_dev(div1, "class", "scrollspy-example-2");
    			add_location(div1, file$1, 58, 4, 2341);
    			attr_dev(div2, "class", "col-8");
    			add_location(div2, file$1, 57, 2, 2317);
    			attr_dev(div3, "class", "row");
    			add_location(div3, file$1, 37, 0, 1678);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, nav1);
    			mount_component(navbar, nav1, null);
    			append_dev(nav1, t0);
    			append_dev(nav1, h1);
    			append_dev(nav1, t2);
    			append_dev(nav1, nav0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(nav0, null);
    				}
    			}

    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div1, null);
    				}
    			}

    			/*div1_binding*/ ctx[2](div1);
    			append_dev(div3, t4);
    			mount_component(creditos, div3, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*enlaces*/ 2) {
    				each_value_1 = /*enlaces*/ ctx[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(nav0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*paginas*/ 0) {
    				each_value = paginas$1;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(creditos.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(creditos.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(navbar);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			/*div1_binding*/ ctx[2](null);
    			destroy_component(creditos);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Modulo7', slots, []);
    	let scrollContainer;

    	onMount(() => {
    		if (scrollContainer) {
    			// Si ya había una instancia, destruye primero
    			ScrollSpy.getInstance(scrollContainer)?.dispose();

    			// Crea una nueva instancia
    			new ScrollSpy(scrollContainer, { target: "#navbar-m7", smoothScroll: true });
    		}
    	});

    	let enlaces = [
    		{
    			titulo: "Desarrollos Locales",
    			direccion: "#m7item-1",
    			direcciones: []
    		},
    		{
    			titulo: "Región Norte",
    			direccion: "#m7item-2",
    			direcciones: [
    				{
    					titulo: "Ixcateopan",
    					enlace: "#m7item-2-1"
    				}
    			]
    		},
    		{
    			titulo: "Región Montaña",
    			direccion: "#m7item-3",
    			direcciones: []
    		},
    		{
    			titulo: "Región Centro",
    			direccion: "#m7item-4",
    			direcciones: [
    				{
    					titulo: "Tehuacalco",
    					enlace: "#m7item-4"
    				}
    			]
    		},
    		{
    			titulo: "Región Tierra Caliente",
    			direccion: "#m7item-5",
    			direcciones: [
    				{
    					titulo: "Un Hallazgo Extraordinario",
    					enlace: "#m7item-5-1"
    				}
    			]
    		},
    		{
    			titulo: "Región Acapulco",
    			direccion: "#m7item-6",
    			direcciones: [
    				{
    					titulo: "Palma Sola",
    					enlace: "#m7item-6-1"
    				}
    			]
    		},
    		{
    			titulo: "Región Costa Grande",
    			direccion: "#m7item-7",
    			direcciones: [
    				{
    					titulo: "Coahuayutla",
    					enlace: "#m7item-7-1"
    				},
    				{
    					titulo: "Paletas de Pinturas",
    					enlace: "#m7item-7-2"
    				}
    			]
    		},
    		{
    			titulo: "Región Costa Chica",
    			direccion: "#m7item-8",
    			direcciones: []
    		},
    		{
    			titulo: "Región Sierra",
    			direccion: "#m7item-9",
    			direcciones: []
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Modulo7> was created with unknown prop '${key}'`);
    	});

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			scrollContainer = $$value;
    			$$invalidate(0, scrollContainer);
    		});
    	}

    	$$self.$capture_state = () => ({
    		NavBar,
    		Pagina,
    		paginas: paginas$1,
    		CrearQR,
    		onMount,
    		ScrollSpy,
    		Creditos,
    		scrollContainer,
    		enlaces
    	});

    	$$self.$inject_state = $$props => {
    		if ('scrollContainer' in $$props) $$invalidate(0, scrollContainer = $$props.scrollContainer);
    		if ('enlaces' in $$props) $$invalidate(1, enlaces = $$props.enlaces);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [scrollContainer, enlaces, div1_binding];
    }

    class Modulo7 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modulo7",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    var paginas = [
    	{
    		titulo: "LA TÉCNICA Y LA CREATIVIDAD",
    		texto: "En esta sección podrán apreciar algunas de las manifestaciones culturales más relevantes dejadas por los antiguos pobladores de Guerrero.Se agrupan por temas y materiales empleados para que puedan valorar las técnicas usadas en la elaboración de los objetos, pues recuerden que ellos no contaban con herramientas sofisticadas y aun así lograron crear piezas de gran belleza.",
    		imagenes: [
    			"modulo8/1.png"
    		],
    		audio: "1.mp3",
    		url: "www.google.com"
    	},
    	{
    		titulo: "NO TODO LO QUE BRILLA ES ORO: LA METALURGIA",
    		texto: "Muchos de ustedes creerán que en Guerrero hubo gran cantidad de oro y que todavía se encuentra oculto en las ruinas. Pues no es así, ya se lo llevaron. Primero fueron los mexicas como pago del tributo que imponían a los pueblos conquistados y luego los españoles se apropiaron de los pocos objetos de oro que quedaban. ¿Pero sabían en cambio que el conocimiento de la metalurgia y de técnicas específicas para trabajar el metal fue introducido al Occidente de México desde el área andina de Sudamérica? En Michoacán y Guerrero es posible que haya penetrado por la Cuenca del Balsas, precisamente donde se han reportado lápidas con grabados de estilo sudamericano. Al comparar las técnicas y las diversas aleaciones utilizadas se han determinado dos momentos de su desarrollo en Mesoamérica. El primero ocurrió hacia 800 d.C., o poco antes, es decir en el Epiclásico, cuando en cobre se produjeron principalmente herramientas de mano, como cinceles, leznas y pinzas, pero también cientos de sonoros cascabeles. En el segundo, entre 1200 y 1300 d.C., esto es, durante el Posclásico Temprano, se produjeron sobre todo objetos suntuarios: cascabeles, pinzas y ornamentos corporales. En su elaboración también usaron el cobre, que al combinarlo con otros metales, adquirió brillantes tonalidades doradas o plateadas. En la década de 1990 se localizaron en el área del Balsas Medio seis sitios con evidencias de la fundición y el procesamiento de metales. Estos sitios se caracterizan estar muy cerca de minas de cobre, por estar ubicados junto a corrientes de agua y por presentar evidencias del proceso de molienda y fundición del mineral. Para la molienda se usaron grandes morteros planos y manos; la fundición quedó atestiguada por hornos y escoria. Tres de estos sitios tuvieron además restos de construcciones de piedra, lo que indica que la gente vivía ahí de manera permanente. El sitio más importante es El Manchón, ubicado en una de las estribaciones que bajan de la Sierra Madre del Sur, 25 km en línea recta al suroeste de Ciudad Altamirano, donde se localizaron 33 edificios, además de cuatro hornos de fundición y escoria.",
    		imagenes: [
    			"modulo8/2.png",
    			"modulo8/3.png",
    			"modulo8/4.png",
    			"modulo8/5.png",
    			"modulo8/6.png"
    		],
    		audio: "2.mp3",
    		url: "www.google.com"
    	},
    	{
    		titulo: "LA METALURGIA EN LA TIERRA CALIENTE",
    		texto: "Cientos de objetos de metal fueron recuperados durante el salvamento arqueológico de la Presa El Infiernillo, pero ¿Dónde se procesaba ese metal? En la década de 1990 se localizaron en el área del Balsas Medio seis sitios con evidencias de la fundición y el procesamiento de metales. Estos sitios se caracterizan estar muy cerca de minas de cobre, por estar ubicados junto a corrientes de agua y por presentar evidencias del proceso de molienda y fundición del mineral. Para la molienda se usaron grandes morteros planos y manos; la fundición quedó atestiguada por hornos y escoria.Tres de estos sitios tuvieron además restos de construcciones de piedra, lo que indica que la gente vivía ahí de manera permanente. El sitio más importante es El Manchón, ubicado en una de las estribaciones que bajan de la Sierra Madre del Sur, 25 km en línea recta al suroeste de Ciudad Altamirano, donde se localizaron 33 edificios, además de cuatro hornos de fundición y escoria.",
    		imagenes: [
    			"modulo8/7.png",
    			"modulo8/8.png",
    			"modulo8/9.png",
    			"modulo8/10.png"
    		],
    		audio: "3.mp3",
    		url: "www.google.com"
    	},
    	{
    		titulo: "CONCHAS Y CARACOLES",
    		texto: "Las conchas de bivalvos y caracoles fueron altamente apreciadas por su belleza, variedad, brillantez y colores. Se usaron en forma natural o se trabajaron principalmente en forma de ornamentos, pero también de utensilios, instrumentos y herramientas. Entre los pueblos agricultores, dependientes del agua, se les relacionó con ese vital líquido por su procedencia de mares, lagunas y ríos. En el salvamento arqueológico de la Presa de El Infiernillo se recuperó uno de los acervos más grandes,constituido por 22000 objetos manufacturados de concha.",
    		imagenes: [
    			"modulo8/11.png",
    			"modulo8/12.png",
    			"modulo8/13.png",
    			"modulo8/14.png",
    			"modulo8/15.png"
    		],
    		audio: "4.mp3",
    		url: "www.google.com"
    	},
    	{
    		titulo: "EL ARTE LAPIDARIO Y LA RELIGIÓN",
    		texto: "Hay áreas de Mesoamérica que se caracterizan por los rasgos locales de su cerámica, de su arquitectura o pintura. Guerrero, en cambio, destaca desde el Preclásico por su arte lapidaria. Desde tiempo atrás se ha dicho que la sorprendente variedad de esculturitas y adornos de piedra de diversos colores es la característica más notable de la arqueología guerrerense, y que la marcada presencia de esculturitas de piedra de estilo olmeca y teotihuacano no debe sorprendernos si consideramos que Guerrero fue tierra de hábiles lapidarios, capaces de producir todos los tipos de escultura pétrea usada por los pueblos mesoamericanos. ¿Se han preguntado por qué había tantas y tan variadas figuritas de piedra con forma humana, en especial las abundantes y esquemáticas de estilo Mezcala?, y ¿Por qué existen tan pocas representaciones de deidades en Guerrero, como las veneradas en otras partes de Mesoamérica? Una posible explicación es que originalmente estas figurillas estuvieron pintadas con los rasgos de diferentes dioses, y que al perder esa pintura sólo quedó la piedra desnuda, de rasgos esquemáticos. Esta hipótesis se basa en que muchas de las figuras, máscaras y cabezas de estilo Mezcala, ofrendadas y recuperadas cuidadosamente en el Templo Mayor de Tenochtitlan, conservan rasgos pintados e incrustados de diversas deidades, sobre todo de Tláloc, el dios de la lluvia.",
    		imagenes: [
    			"modulo8/16.png",
    			"modulo8/17.png",
    			"modulo8/18.png",
    			"modulo8/19.png"
    		],
    		audio: "5.mp3",
    		url: "www.google.com"
    	},
    	{
    		titulo: "APORTACIONES DE LA ARQUEOLOGÍA GUERRERENSE",
    		texto: "Por lo que han podido apreciar a lo largo de esta Sala, les recordamos que entre las aportaciones más significativas que la arqueología ha establecido con sus investigaciones más recientes están: La bóveda falsa es oriunda de Guerrero y no una influencia venida de la zona maya. Ya se reconoce a Guerrero como una subárea distinta de Mesoamérica.",
    		imagenes: [
    		],
    		audio: "6.mp3",
    		url: "www.google.com"
    	}
    ];

    /* src/Views/Modulo8.svelte generated by Svelte v3.59.2 */
    const file = "src/Views/Modulo8.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	child_ctx[2] = i;
    	return child_ctx;
    }

    // (12:2) {#each paginas as pagina, i}
    function create_each_block(ctx) {
    	let button0;
    	let t0_value = /*pagina*/ ctx[0].titulo + "";
    	let t0;
    	let t1;
    	let div5;
    	let div4;
    	let div3;
    	let div0;
    	let h5;
    	let t2_value = /*pagina*/ ctx[0].titulo + "";
    	let t2;
    	let t3;
    	let button1;
    	let t4;
    	let div1;
    	let pagina;
    	let t5;
    	let div2;
    	let button2;
    	let current;

    	pagina = new Pagina({
    			props: {
    				titulo: /*pagina*/ ctx[0].titulo,
    				texto: /*pagina*/ ctx[0].texto,
    				imagenes: /*pagina*/ ctx[0].imagenes,
    				id: "idm8-" + /*i*/ ctx[2],
    				indice: "indicem8" + /*i*/ ctx[2],
    				audio: "modulo8/" + /*pagina*/ ctx[0].audio
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			button0 = element("button");
    			t0 = text(t0_value);
    			t1 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			h5 = element("h5");
    			t2 = text(t2_value);
    			t3 = space();
    			button1 = element("button");
    			t4 = space();
    			div1 = element("div");
    			create_component(pagina.$$.fragment);
    			t5 = space();
    			div2 = element("div");
    			button2 = element("button");
    			button2.textContent = "Cerrar";
    			attr_dev(button0, "class", "btn btn-primary btn-lg py-4 svelte-wvfh9e");
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "data-bs-toggle", "modal");
    			attr_dev(button0, "data-bs-target", "#modalM8-" + /*i*/ ctx[2]);
    			add_location(button0, file, 13, 4, 465);
    			attr_dev(h5, "class", "modal-title");
    			attr_dev(h5, "id", "modalM8Label-" + /*i*/ ctx[2]);
    			add_location(h5, file, 31, 12, 983);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "btn-close svelte-wvfh9e");
    			attr_dev(button1, "data-bs-dismiss", "modal");
    			attr_dev(button1, "aria-label", "Cerrar");
    			add_location(button1, file, 32, 12, 1065);
    			attr_dev(div0, "class", "modal-header");
    			add_location(div0, file, 30, 10, 944);
    			attr_dev(div1, "class", "modal-body");
    			add_location(div1, file, 34, 10, 1186);
    			attr_dev(button2, "type", "button");
    			attr_dev(button2, "class", "btn btn-secondary svelte-wvfh9e");
    			attr_dev(button2, "data-bs-dismiss", "modal");
    			add_location(button2, file, 44, 12, 1520);
    			attr_dev(div2, "class", "modal-footer");
    			add_location(div2, file, 43, 10, 1481);
    			attr_dev(div3, "class", "modal-content");
    			add_location(div3, file, 29, 8, 906);
    			attr_dev(div4, "class", "modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable");
    			add_location(div4, file, 28, 6, 816);
    			attr_dev(div5, "class", "modal fade");
    			attr_dev(div5, "id", "modalM8-" + /*i*/ ctx[2]);
    			attr_dev(div5, "tabindex", "-1");
    			attr_dev(div5, "aria-labelledby", "modalM8Label-" + /*i*/ ctx[2]);
    			attr_dev(div5, "aria-hidden", "true");
    			add_location(div5, file, 22, 4, 664);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button0, anchor);
    			append_dev(button0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div0, h5);
    			append_dev(h5, t2);
    			append_dev(div0, t3);
    			append_dev(div0, button1);
    			append_dev(div3, t4);
    			append_dev(div3, div1);
    			mount_component(pagina, div1, null);
    			append_dev(div3, t5);
    			append_dev(div3, div2);
    			append_dev(div2, button2);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pagina.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pagina.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div5);
    			destroy_component(pagina);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(12:2) {#each paginas as pagina, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let navbar;
    	let t0;
    	let h1;
    	let t2;
    	let div;
    	let t3;
    	let crearqr;
    	let t4;
    	let creditos;
    	let current;
    	navbar = new NavBar({ $$inline: true });
    	let each_value = paginas;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	crearqr = new CrearQR({
    			props: {
    				url: "https://mediateca.inah.gob.mx/islandora_74/islandora/object/issue%3A1358"
    			},
    			$$inline: true
    		});

    	creditos = new Creditos({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "MÓDULO 8 - LA TÉCNICA Y LA CREATIVIDAD";
    			t2 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			create_component(crearqr.$$.fragment);
    			t4 = space();
    			create_component(creditos.$$.fragment);
    			attr_dev(h1, "class", "mb-4");
    			add_location(h1, file, 8, 0, 297);
    			attr_dev(div, "class", "d-grid gap-3 svelte-wvfh9e");
    			add_location(div, file, 10, 0, 359);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}

    			append_dev(div, t3);
    			mount_component(crearqr, div, null);
    			append_dev(div, t4);
    			mount_component(creditos, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*paginas*/ 0) {
    				each_value = paginas;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, t3);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(crearqr.$$.fragment, local);
    			transition_in(creditos.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(crearqr.$$.fragment, local);
    			transition_out(creditos.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			destroy_component(crearqr);
    			destroy_component(creditos);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Modulo8', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Modulo8> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Creditos,
    		NavBar,
    		Pagina,
    		paginas,
    		CrearQR
    	});

    	return [];
    }

    class Modulo8 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modulo8",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.59.2 */

    function create_fragment(ctx) {
    	let router;
    	let current;

    	router = new Router({
    			props: { routes: /*routes*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	const routes = {
    		'/': Home,
    		'/modulo1': Modulo1,
    		'/modulo2': Modulo2,
    		'/modulo3': Modulo3,
    		'/modulo4': Modulo4,
    		'/modulo5': Modulo5,
    		'/modulo6': Modulo6,
    		'/modulo7': Modulo7,
    		'/modulo8': Modulo8
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Router,
    		Home,
    		Modulo1,
    		Modulo2,
    		Modulo3,
    		Modulo4,
    		Modulo5,
    		Modulo6,
    		Modulo7,
    		Modulo8,
    		routes
    	});

    	return [routes];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var bootstrap_bundle_min = {exports: {}};

    /*!
      * Bootstrap v5.3.8 (https://getbootstrap.com/)
      * Copyright 2011-2025 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
      * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
      */

    (function (module, exports) {
    	!function(t,e){module.exports=e();}(commonjsGlobal,function(){const t=new Map,e={set(e,i,n){t.has(e)||t.set(e,new Map);const s=t.get(e);s.has(i)||0===s.size?s.set(i,n):console.error(`Bootstrap doesn't allow more than one instance per element. Bound instance: ${Array.from(s.keys())[0]}.`);},get:(e,i)=>t.has(e)&&t.get(e).get(i)||null,remove(e,i){if(!t.has(e))return;const n=t.get(e);n.delete(i),0===n.size&&t.delete(e);}},i="transitionend",n=t=>(t&&window.CSS&&window.CSS.escape&&(t=t.replace(/#([^\s"#']+)/g,(t,e)=>`#${CSS.escape(e)}`)),t),s=t=>null==t?`${t}`:Object.prototype.toString.call(t).match(/\s([a-z]+)/i)[1].toLowerCase(),o=t=>{t.dispatchEvent(new Event(i));},r=t=>!(!t||"object"!=typeof t)&&(void 0!==t.jquery&&(t=t[0]),void 0!==t.nodeType),a=t=>r(t)?t.jquery?t[0]:t:"string"==typeof t&&t.length>0?document.querySelector(n(t)):null,l=t=>{if(!r(t)||0===t.getClientRects().length)return !1;const e="visible"===getComputedStyle(t).getPropertyValue("visibility"),i=t.closest("details:not([open])");if(!i)return e;if(i!==t){const e=t.closest("summary");if(e&&e.parentNode!==i)return !1;if(null===e)return !1}return e},c=t=>!t||t.nodeType!==Node.ELEMENT_NODE||!!t.classList.contains("disabled")||(void 0!==t.disabled?t.disabled:t.hasAttribute("disabled")&&"false"!==t.getAttribute("disabled")),h=t=>{if(!document.documentElement.attachShadow)return null;if("function"==typeof t.getRootNode){const e=t.getRootNode();return e instanceof ShadowRoot?e:null}return t instanceof ShadowRoot?t:t.parentNode?h(t.parentNode):null},d=()=>{},u=t=>{t.offsetHeight;},f=()=>window.jQuery&&!document.body.hasAttribute("data-bs-no-jquery")?window.jQuery:null,p=[],m=()=>"rtl"===document.documentElement.dir,g=t=>{var e;e=()=>{const e=f();if(e){const i=t.NAME,n=e.fn[i];e.fn[i]=t.jQueryInterface,e.fn[i].Constructor=t,e.fn[i].noConflict=()=>(e.fn[i]=n,t.jQueryInterface);}},"loading"===document.readyState?(p.length||document.addEventListener("DOMContentLoaded",()=>{for(const t of p)t();}),p.push(e)):e();},_=(t,e=[],i=t)=>"function"==typeof t?t.call(...e):i,b=(t,e,n=!0)=>{if(!n)return void _(t);const s=(t=>{if(!t)return 0;let{transitionDuration:e,transitionDelay:i}=window.getComputedStyle(t);const n=Number.parseFloat(e),s=Number.parseFloat(i);return n||s?(e=e.split(",")[0],i=i.split(",")[0],1e3*(Number.parseFloat(e)+Number.parseFloat(i))):0})(e)+5;let r=!1;const a=({target:n})=>{n===e&&(r=!0,e.removeEventListener(i,a),_(t));};e.addEventListener(i,a),setTimeout(()=>{r||o(e);},s);},v=(t,e,i,n)=>{const s=t.length;let o=t.indexOf(e);return -1===o?!i&&n?t[s-1]:t[0]:(o+=i?1:-1,n&&(o=(o+s)%s),t[Math.max(0,Math.min(o,s-1))])},y=/[^.]*(?=\..*)\.|.*/,w=/\..*/,A=/::\d+$/,E={};let T=1;const C={mouseenter:"mouseover",mouseleave:"mouseout"},O=new Set(["click","dblclick","mouseup","mousedown","contextmenu","mousewheel","DOMMouseScroll","mouseover","mouseout","mousemove","selectstart","selectend","keydown","keypress","keyup","orientationchange","touchstart","touchmove","touchend","touchcancel","pointerdown","pointermove","pointerup","pointerleave","pointercancel","gesturestart","gesturechange","gestureend","focus","blur","change","reset","select","submit","focusin","focusout","load","unload","beforeunload","resize","move","DOMContentLoaded","readystatechange","error","abort","scroll"]);function x(t,e){return e&&`${e}::${T++}`||t.uidEvent||T++}function k(t){const e=x(t);return t.uidEvent=e,E[e]=E[e]||{},E[e]}function L(t,e,i=null){return Object.values(t).find(t=>t.callable===e&&t.delegationSelector===i)}function S(t,e,i){const n="string"==typeof e,s=n?i:e||i;let o=N(t);return O.has(o)||(o=t),[n,s,o]}function D(t,e,i,n,s){if("string"!=typeof e||!t)return;let[o,r,a]=S(e,i,n);if(e in C){const t=t=>function(e){if(!e.relatedTarget||e.relatedTarget!==e.delegateTarget&&!e.delegateTarget.contains(e.relatedTarget))return t.call(this,e)};r=t(r);}const l=k(t),c=l[a]||(l[a]={}),h=L(c,r,o?i:null);if(h)return void(h.oneOff=h.oneOff&&s);const d=x(r,e.replace(y,"")),u=o?function(t,e,i){return function n(s){const o=t.querySelectorAll(e);for(let{target:r}=s;r&&r!==this;r=r.parentNode)for(const a of o)if(a===r)return j(s,{delegateTarget:r}),n.oneOff&&P.off(t,s.type,e,i),i.apply(r,[s])}}(t,i,r):function(t,e){return function i(n){return j(n,{delegateTarget:t}),i.oneOff&&P.off(t,n.type,e),e.apply(t,[n])}}(t,r);u.delegationSelector=o?i:null,u.callable=r,u.oneOff=s,u.uidEvent=d,c[d]=u,t.addEventListener(a,u,o);}function $(t,e,i,n,s){const o=L(e[i],n,s);o&&(t.removeEventListener(i,o,Boolean(s)),delete e[i][o.uidEvent]);}function I(t,e,i,n){const s=e[i]||{};for(const[o,r]of Object.entries(s))o.includes(n)&&$(t,e,i,r.callable,r.delegationSelector);}function N(t){return t=t.replace(w,""),C[t]||t}const P={on(t,e,i,n){D(t,e,i,n,!1);},one(t,e,i,n){D(t,e,i,n,!0);},off(t,e,i,n){if("string"!=typeof e||!t)return;const[s,o,r]=S(e,i,n),a=r!==e,l=k(t),c=l[r]||{},h=e.startsWith(".");if(void 0===o){if(h)for(const i of Object.keys(l))I(t,l,i,e.slice(1));for(const[i,n]of Object.entries(c)){const s=i.replace(A,"");a&&!e.includes(s)||$(t,l,r,n.callable,n.delegationSelector);}}else {if(!Object.keys(c).length)return;$(t,l,r,o,s?i:null);}},trigger(t,e,i){if("string"!=typeof e||!t)return null;const n=f();let s=null,o=!0,r=!0,a=!1;e!==N(e)&&n&&(s=n.Event(e,i),n(t).trigger(s),o=!s.isPropagationStopped(),r=!s.isImmediatePropagationStopped(),a=s.isDefaultPrevented());const l=j(new Event(e,{bubbles:o,cancelable:!0}),i);return a&&l.preventDefault(),r&&t.dispatchEvent(l),l.defaultPrevented&&s&&s.preventDefault(),l}};function j(t,e={}){for(const[i,n]of Object.entries(e))try{t[i]=n;}catch(e){Object.defineProperty(t,i,{configurable:!0,get:()=>n});}return t}function M(t){if("true"===t)return !0;if("false"===t)return !1;if(t===Number(t).toString())return Number(t);if(""===t||"null"===t)return null;if("string"!=typeof t)return t;try{return JSON.parse(decodeURIComponent(t))}catch(e){return t}}function F(t){return t.replace(/[A-Z]/g,t=>`-${t.toLowerCase()}`)}const H={setDataAttribute(t,e,i){t.setAttribute(`data-bs-${F(e)}`,i);},removeDataAttribute(t,e){t.removeAttribute(`data-bs-${F(e)}`);},getDataAttributes(t){if(!t)return {};const e={},i=Object.keys(t.dataset).filter(t=>t.startsWith("bs")&&!t.startsWith("bsConfig"));for(const n of i){let i=n.replace(/^bs/,"");i=i.charAt(0).toLowerCase()+i.slice(1),e[i]=M(t.dataset[n]);}return e},getDataAttribute:(t,e)=>M(t.getAttribute(`data-bs-${F(e)}`))};class W{static get Default(){return {}}static get DefaultType(){return {}}static get NAME(){throw new Error('You have to implement the static method "NAME", for each component!')}_getConfig(t){return t=this._mergeConfigObj(t),t=this._configAfterMerge(t),this._typeCheckConfig(t),t}_configAfterMerge(t){return t}_mergeConfigObj(t,e){const i=r(e)?H.getDataAttribute(e,"config"):{};return {...this.constructor.Default,..."object"==typeof i?i:{},...r(e)?H.getDataAttributes(e):{},..."object"==typeof t?t:{}}}_typeCheckConfig(t,e=this.constructor.DefaultType){for(const[i,n]of Object.entries(e)){const e=t[i],o=r(e)?"element":s(e);if(!new RegExp(n).test(o))throw new TypeError(`${this.constructor.NAME.toUpperCase()}: Option "${i}" provided type "${o}" but expected type "${n}".`)}}}class B extends W{constructor(t,i){super(),(t=a(t))&&(this._element=t,this._config=this._getConfig(i),e.set(this._element,this.constructor.DATA_KEY,this));}dispose(){e.remove(this._element,this.constructor.DATA_KEY),P.off(this._element,this.constructor.EVENT_KEY);for(const t of Object.getOwnPropertyNames(this))this[t]=null;}_queueCallback(t,e,i=!0){b(t,e,i);}_getConfig(t){return t=this._mergeConfigObj(t,this._element),t=this._configAfterMerge(t),this._typeCheckConfig(t),t}static getInstance(t){return e.get(a(t),this.DATA_KEY)}static getOrCreateInstance(t,e={}){return this.getInstance(t)||new this(t,"object"==typeof e?e:null)}static get VERSION(){return "5.3.8"}static get DATA_KEY(){return `bs.${this.NAME}`}static get EVENT_KEY(){return `.${this.DATA_KEY}`}static eventName(t){return `${t}${this.EVENT_KEY}`}}const z=t=>{let e=t.getAttribute("data-bs-target");if(!e||"#"===e){let i=t.getAttribute("href");if(!i||!i.includes("#")&&!i.startsWith("."))return null;i.includes("#")&&!i.startsWith("#")&&(i=`#${i.split("#")[1]}`),e=i&&"#"!==i?i.trim():null;}return e?e.split(",").map(t=>n(t)).join(","):null},R={find:(t,e=document.documentElement)=>[].concat(...Element.prototype.querySelectorAll.call(e,t)),findOne:(t,e=document.documentElement)=>Element.prototype.querySelector.call(e,t),children:(t,e)=>[].concat(...t.children).filter(t=>t.matches(e)),parents(t,e){const i=[];let n=t.parentNode.closest(e);for(;n;)i.push(n),n=n.parentNode.closest(e);return i},prev(t,e){let i=t.previousElementSibling;for(;i;){if(i.matches(e))return [i];i=i.previousElementSibling;}return []},next(t,e){let i=t.nextElementSibling;for(;i;){if(i.matches(e))return [i];i=i.nextElementSibling;}return []},focusableChildren(t){const e=["a","button","input","textarea","select","details","[tabindex]",'[contenteditable="true"]'].map(t=>`${t}:not([tabindex^="-"])`).join(",");return this.find(e,t).filter(t=>!c(t)&&l(t))},getSelectorFromElement(t){const e=z(t);return e&&R.findOne(e)?e:null},getElementFromSelector(t){const e=z(t);return e?R.findOne(e):null},getMultipleElementsFromSelector(t){const e=z(t);return e?R.find(e):[]}},q=(t,e="hide")=>{const i=`click.dismiss${t.EVENT_KEY}`,n=t.NAME;P.on(document,i,`[data-bs-dismiss="${n}"]`,function(i){if(["A","AREA"].includes(this.tagName)&&i.preventDefault(),c(this))return;const s=R.getElementFromSelector(this)||this.closest(`.${n}`);t.getOrCreateInstance(s)[e]();});},V=".bs.alert",K=`close${V}`,Q=`closed${V}`;class X extends B{static get NAME(){return "alert"}close(){if(P.trigger(this._element,K).defaultPrevented)return;this._element.classList.remove("show");const t=this._element.classList.contains("fade");this._queueCallback(()=>this._destroyElement(),this._element,t);}_destroyElement(){this._element.remove(),P.trigger(this._element,Q),this.dispose();}static jQueryInterface(t){return this.each(function(){const e=X.getOrCreateInstance(this);if("string"==typeof t){if(void 0===e[t]||t.startsWith("_")||"constructor"===t)throw new TypeError(`No method named "${t}"`);e[t](this);}})}}q(X,"close"),g(X);const Y='[data-bs-toggle="button"]';class U extends B{static get NAME(){return "button"}toggle(){this._element.setAttribute("aria-pressed",this._element.classList.toggle("active"));}static jQueryInterface(t){return this.each(function(){const e=U.getOrCreateInstance(this);"toggle"===t&&e[t]();})}}P.on(document,"click.bs.button.data-api",Y,t=>{t.preventDefault();const e=t.target.closest(Y);U.getOrCreateInstance(e).toggle();}),g(U);const G=".bs.swipe",J=`touchstart${G}`,Z=`touchmove${G}`,tt=`touchend${G}`,et=`pointerdown${G}`,it=`pointerup${G}`,nt={endCallback:null,leftCallback:null,rightCallback:null},st={endCallback:"(function|null)",leftCallback:"(function|null)",rightCallback:"(function|null)"};class ot extends W{constructor(t,e){super(),this._element=t,t&&ot.isSupported()&&(this._config=this._getConfig(e),this._deltaX=0,this._supportPointerEvents=Boolean(window.PointerEvent),this._initEvents());}static get Default(){return nt}static get DefaultType(){return st}static get NAME(){return "swipe"}dispose(){P.off(this._element,G);}_start(t){this._supportPointerEvents?this._eventIsPointerPenTouch(t)&&(this._deltaX=t.clientX):this._deltaX=t.touches[0].clientX;}_end(t){this._eventIsPointerPenTouch(t)&&(this._deltaX=t.clientX-this._deltaX),this._handleSwipe(),_(this._config.endCallback);}_move(t){this._deltaX=t.touches&&t.touches.length>1?0:t.touches[0].clientX-this._deltaX;}_handleSwipe(){const t=Math.abs(this._deltaX);if(t<=40)return;const e=t/this._deltaX;this._deltaX=0,e&&_(e>0?this._config.rightCallback:this._config.leftCallback);}_initEvents(){this._supportPointerEvents?(P.on(this._element,et,t=>this._start(t)),P.on(this._element,it,t=>this._end(t)),this._element.classList.add("pointer-event")):(P.on(this._element,J,t=>this._start(t)),P.on(this._element,Z,t=>this._move(t)),P.on(this._element,tt,t=>this._end(t)));}_eventIsPointerPenTouch(t){return this._supportPointerEvents&&("pen"===t.pointerType||"touch"===t.pointerType)}static isSupported(){return "ontouchstart"in document.documentElement||navigator.maxTouchPoints>0}}const rt=".bs.carousel",at=".data-api",lt="ArrowLeft",ct="ArrowRight",ht="next",dt="prev",ut="left",ft="right",pt=`slide${rt}`,mt=`slid${rt}`,gt=`keydown${rt}`,_t=`mouseenter${rt}`,bt=`mouseleave${rt}`,vt=`dragstart${rt}`,yt=`load${rt}${at}`,wt=`click${rt}${at}`,At="carousel",Et="active",Tt=".active",Ct=".carousel-item",Ot=Tt+Ct,xt={[lt]:ft,[ct]:ut},kt={interval:5e3,keyboard:!0,pause:"hover",ride:!1,touch:!0,wrap:!0},Lt={interval:"(number|boolean)",keyboard:"boolean",pause:"(string|boolean)",ride:"(boolean|string)",touch:"boolean",wrap:"boolean"};class St extends B{constructor(t,e){super(t,e),this._interval=null,this._activeElement=null,this._isSliding=!1,this.touchTimeout=null,this._swipeHelper=null,this._indicatorsElement=R.findOne(".carousel-indicators",this._element),this._addEventListeners(),this._config.ride===At&&this.cycle();}static get Default(){return kt}static get DefaultType(){return Lt}static get NAME(){return "carousel"}next(){this._slide(ht);}nextWhenVisible(){!document.hidden&&l(this._element)&&this.next();}prev(){this._slide(dt);}pause(){this._isSliding&&o(this._element),this._clearInterval();}cycle(){this._clearInterval(),this._updateInterval(),this._interval=setInterval(()=>this.nextWhenVisible(),this._config.interval);}_maybeEnableCycle(){this._config.ride&&(this._isSliding?P.one(this._element,mt,()=>this.cycle()):this.cycle());}to(t){const e=this._getItems();if(t>e.length-1||t<0)return;if(this._isSliding)return void P.one(this._element,mt,()=>this.to(t));const i=this._getItemIndex(this._getActive());if(i===t)return;const n=t>i?ht:dt;this._slide(n,e[t]);}dispose(){this._swipeHelper&&this._swipeHelper.dispose(),super.dispose();}_configAfterMerge(t){return t.defaultInterval=t.interval,t}_addEventListeners(){this._config.keyboard&&P.on(this._element,gt,t=>this._keydown(t)),"hover"===this._config.pause&&(P.on(this._element,_t,()=>this.pause()),P.on(this._element,bt,()=>this._maybeEnableCycle())),this._config.touch&&ot.isSupported()&&this._addTouchEventListeners();}_addTouchEventListeners(){for(const t of R.find(".carousel-item img",this._element))P.on(t,vt,t=>t.preventDefault());const t={leftCallback:()=>this._slide(this._directionToOrder(ut)),rightCallback:()=>this._slide(this._directionToOrder(ft)),endCallback:()=>{"hover"===this._config.pause&&(this.pause(),this.touchTimeout&&clearTimeout(this.touchTimeout),this.touchTimeout=setTimeout(()=>this._maybeEnableCycle(),500+this._config.interval));}};this._swipeHelper=new ot(this._element,t);}_keydown(t){if(/input|textarea/i.test(t.target.tagName))return;const e=xt[t.key];e&&(t.preventDefault(),this._slide(this._directionToOrder(e)));}_getItemIndex(t){return this._getItems().indexOf(t)}_setActiveIndicatorElement(t){if(!this._indicatorsElement)return;const e=R.findOne(Tt,this._indicatorsElement);e.classList.remove(Et),e.removeAttribute("aria-current");const i=R.findOne(`[data-bs-slide-to="${t}"]`,this._indicatorsElement);i&&(i.classList.add(Et),i.setAttribute("aria-current","true"));}_updateInterval(){const t=this._activeElement||this._getActive();if(!t)return;const e=Number.parseInt(t.getAttribute("data-bs-interval"),10);this._config.interval=e||this._config.defaultInterval;}_slide(t,e=null){if(this._isSliding)return;const i=this._getActive(),n=t===ht,s=e||v(this._getItems(),i,n,this._config.wrap);if(s===i)return;const o=this._getItemIndex(s),r=e=>P.trigger(this._element,e,{relatedTarget:s,direction:this._orderToDirection(t),from:this._getItemIndex(i),to:o});if(r(pt).defaultPrevented)return;if(!i||!s)return;const a=Boolean(this._interval);this.pause(),this._isSliding=!0,this._setActiveIndicatorElement(o),this._activeElement=s;const l=n?"carousel-item-start":"carousel-item-end",c=n?"carousel-item-next":"carousel-item-prev";s.classList.add(c),u(s),i.classList.add(l),s.classList.add(l),this._queueCallback(()=>{s.classList.remove(l,c),s.classList.add(Et),i.classList.remove(Et,c,l),this._isSliding=!1,r(mt);},i,this._isAnimated()),a&&this.cycle();}_isAnimated(){return this._element.classList.contains("slide")}_getActive(){return R.findOne(Ot,this._element)}_getItems(){return R.find(Ct,this._element)}_clearInterval(){this._interval&&(clearInterval(this._interval),this._interval=null);}_directionToOrder(t){return m()?t===ut?dt:ht:t===ut?ht:dt}_orderToDirection(t){return m()?t===dt?ut:ft:t===dt?ft:ut}static jQueryInterface(t){return this.each(function(){const e=St.getOrCreateInstance(this,t);if("number"!=typeof t){if("string"==typeof t){if(void 0===e[t]||t.startsWith("_")||"constructor"===t)throw new TypeError(`No method named "${t}"`);e[t]();}}else e.to(t);})}}P.on(document,wt,"[data-bs-slide], [data-bs-slide-to]",function(t){const e=R.getElementFromSelector(this);if(!e||!e.classList.contains(At))return;t.preventDefault();const i=St.getOrCreateInstance(e),n=this.getAttribute("data-bs-slide-to");return n?(i.to(n),void i._maybeEnableCycle()):"next"===H.getDataAttribute(this,"slide")?(i.next(),void i._maybeEnableCycle()):(i.prev(),void i._maybeEnableCycle())}),P.on(window,yt,()=>{const t=R.find('[data-bs-ride="carousel"]');for(const e of t)St.getOrCreateInstance(e);}),g(St);const Dt=".bs.collapse",$t=`show${Dt}`,It=`shown${Dt}`,Nt=`hide${Dt}`,Pt=`hidden${Dt}`,jt=`click${Dt}.data-api`,Mt="show",Ft="collapse",Ht="collapsing",Wt=`:scope .${Ft} .${Ft}`,Bt='[data-bs-toggle="collapse"]',zt={parent:null,toggle:!0},Rt={parent:"(null|element)",toggle:"boolean"};class qt extends B{constructor(t,e){super(t,e),this._isTransitioning=!1,this._triggerArray=[];const i=R.find(Bt);for(const t of i){const e=R.getSelectorFromElement(t),i=R.find(e).filter(t=>t===this._element);null!==e&&i.length&&this._triggerArray.push(t);}this._initializeChildren(),this._config.parent||this._addAriaAndCollapsedClass(this._triggerArray,this._isShown()),this._config.toggle&&this.toggle();}static get Default(){return zt}static get DefaultType(){return Rt}static get NAME(){return "collapse"}toggle(){this._isShown()?this.hide():this.show();}show(){if(this._isTransitioning||this._isShown())return;let t=[];if(this._config.parent&&(t=this._getFirstLevelChildren(".collapse.show, .collapse.collapsing").filter(t=>t!==this._element).map(t=>qt.getOrCreateInstance(t,{toggle:!1}))),t.length&&t[0]._isTransitioning)return;if(P.trigger(this._element,$t).defaultPrevented)return;for(const e of t)e.hide();const e=this._getDimension();this._element.classList.remove(Ft),this._element.classList.add(Ht),this._element.style[e]=0,this._addAriaAndCollapsedClass(this._triggerArray,!0),this._isTransitioning=!0;const i=`scroll${e[0].toUpperCase()+e.slice(1)}`;this._queueCallback(()=>{this._isTransitioning=!1,this._element.classList.remove(Ht),this._element.classList.add(Ft,Mt),this._element.style[e]="",P.trigger(this._element,It);},this._element,!0),this._element.style[e]=`${this._element[i]}px`;}hide(){if(this._isTransitioning||!this._isShown())return;if(P.trigger(this._element,Nt).defaultPrevented)return;const t=this._getDimension();this._element.style[t]=`${this._element.getBoundingClientRect()[t]}px`,u(this._element),this._element.classList.add(Ht),this._element.classList.remove(Ft,Mt);for(const t of this._triggerArray){const e=R.getElementFromSelector(t);e&&!this._isShown(e)&&this._addAriaAndCollapsedClass([t],!1);}this._isTransitioning=!0,this._element.style[t]="",this._queueCallback(()=>{this._isTransitioning=!1,this._element.classList.remove(Ht),this._element.classList.add(Ft),P.trigger(this._element,Pt);},this._element,!0);}_isShown(t=this._element){return t.classList.contains(Mt)}_configAfterMerge(t){return t.toggle=Boolean(t.toggle),t.parent=a(t.parent),t}_getDimension(){return this._element.classList.contains("collapse-horizontal")?"width":"height"}_initializeChildren(){if(!this._config.parent)return;const t=this._getFirstLevelChildren(Bt);for(const e of t){const t=R.getElementFromSelector(e);t&&this._addAriaAndCollapsedClass([e],this._isShown(t));}}_getFirstLevelChildren(t){const e=R.find(Wt,this._config.parent);return R.find(t,this._config.parent).filter(t=>!e.includes(t))}_addAriaAndCollapsedClass(t,e){if(t.length)for(const i of t)i.classList.toggle("collapsed",!e),i.setAttribute("aria-expanded",e);}static jQueryInterface(t){const e={};return "string"==typeof t&&/show|hide/.test(t)&&(e.toggle=!1),this.each(function(){const i=qt.getOrCreateInstance(this,e);if("string"==typeof t){if(void 0===i[t])throw new TypeError(`No method named "${t}"`);i[t]();}})}}P.on(document,jt,Bt,function(t){("A"===t.target.tagName||t.delegateTarget&&"A"===t.delegateTarget.tagName)&&t.preventDefault();for(const t of R.getMultipleElementsFromSelector(this))qt.getOrCreateInstance(t,{toggle:!1}).toggle();}),g(qt);var Vt="top",Kt="bottom",Qt="right",Xt="left",Yt="auto",Ut=[Vt,Kt,Qt,Xt],Gt="start",Jt="end",Zt="clippingParents",te="viewport",ee="popper",ie="reference",ne=Ut.reduce(function(t,e){return t.concat([e+"-"+Gt,e+"-"+Jt])},[]),se=[].concat(Ut,[Yt]).reduce(function(t,e){return t.concat([e,e+"-"+Gt,e+"-"+Jt])},[]),oe="beforeRead",re="read",ae="afterRead",le="beforeMain",ce="main",he="afterMain",de="beforeWrite",ue="write",fe="afterWrite",pe=[oe,re,ae,le,ce,he,de,ue,fe];function me(t){return t?(t.nodeName||"").toLowerCase():null}function ge(t){if(null==t)return window;if("[object Window]"!==t.toString()){var e=t.ownerDocument;return e&&e.defaultView||window}return t}function _e(t){return t instanceof ge(t).Element||t instanceof Element}function be(t){return t instanceof ge(t).HTMLElement||t instanceof HTMLElement}function ve(t){return "undefined"!=typeof ShadowRoot&&(t instanceof ge(t).ShadowRoot||t instanceof ShadowRoot)}const ye={name:"applyStyles",enabled:!0,phase:"write",fn:function(t){var e=t.state;Object.keys(e.elements).forEach(function(t){var i=e.styles[t]||{},n=e.attributes[t]||{},s=e.elements[t];be(s)&&me(s)&&(Object.assign(s.style,i),Object.keys(n).forEach(function(t){var e=n[t];!1===e?s.removeAttribute(t):s.setAttribute(t,!0===e?"":e);}));});},effect:function(t){var e=t.state,i={popper:{position:e.options.strategy,left:"0",top:"0",margin:"0"},arrow:{position:"absolute"},reference:{}};return Object.assign(e.elements.popper.style,i.popper),e.styles=i,e.elements.arrow&&Object.assign(e.elements.arrow.style,i.arrow),function(){Object.keys(e.elements).forEach(function(t){var n=e.elements[t],s=e.attributes[t]||{},o=Object.keys(e.styles.hasOwnProperty(t)?e.styles[t]:i[t]).reduce(function(t,e){return t[e]="",t},{});be(n)&&me(n)&&(Object.assign(n.style,o),Object.keys(s).forEach(function(t){n.removeAttribute(t);}));});}},requires:["computeStyles"]};function we(t){return t.split("-")[0]}var Ae=Math.max,Ee=Math.min,Te=Math.round;function Ce(){var t=navigator.userAgentData;return null!=t&&t.brands&&Array.isArray(t.brands)?t.brands.map(function(t){return t.brand+"/"+t.version}).join(" "):navigator.userAgent}function Oe(){return !/^((?!chrome|android).)*safari/i.test(Ce())}function xe(t,e,i){void 0===e&&(e=!1),void 0===i&&(i=!1);var n=t.getBoundingClientRect(),s=1,o=1;e&&be(t)&&(s=t.offsetWidth>0&&Te(n.width)/t.offsetWidth||1,o=t.offsetHeight>0&&Te(n.height)/t.offsetHeight||1);var r=(_e(t)?ge(t):window).visualViewport,a=!Oe()&&i,l=(n.left+(a&&r?r.offsetLeft:0))/s,c=(n.top+(a&&r?r.offsetTop:0))/o,h=n.width/s,d=n.height/o;return {width:h,height:d,top:c,right:l+h,bottom:c+d,left:l,x:l,y:c}}function ke(t){var e=xe(t),i=t.offsetWidth,n=t.offsetHeight;return Math.abs(e.width-i)<=1&&(i=e.width),Math.abs(e.height-n)<=1&&(n=e.height),{x:t.offsetLeft,y:t.offsetTop,width:i,height:n}}function Le(t,e){var i=e.getRootNode&&e.getRootNode();if(t.contains(e))return !0;if(i&&ve(i)){var n=e;do{if(n&&t.isSameNode(n))return !0;n=n.parentNode||n.host;}while(n)}return !1}function Se(t){return ge(t).getComputedStyle(t)}function De(t){return ["table","td","th"].indexOf(me(t))>=0}function $e(t){return ((_e(t)?t.ownerDocument:t.document)||window.document).documentElement}function Ie(t){return "html"===me(t)?t:t.assignedSlot||t.parentNode||(ve(t)?t.host:null)||$e(t)}function Ne(t){return be(t)&&"fixed"!==Se(t).position?t.offsetParent:null}function Pe(t){for(var e=ge(t),i=Ne(t);i&&De(i)&&"static"===Se(i).position;)i=Ne(i);return i&&("html"===me(i)||"body"===me(i)&&"static"===Se(i).position)?e:i||function(t){var e=/firefox/i.test(Ce());if(/Trident/i.test(Ce())&&be(t)&&"fixed"===Se(t).position)return null;var i=Ie(t);for(ve(i)&&(i=i.host);be(i)&&["html","body"].indexOf(me(i))<0;){var n=Se(i);if("none"!==n.transform||"none"!==n.perspective||"paint"===n.contain||-1!==["transform","perspective"].indexOf(n.willChange)||e&&"filter"===n.willChange||e&&n.filter&&"none"!==n.filter)return i;i=i.parentNode;}return null}(t)||e}function je(t){return ["top","bottom"].indexOf(t)>=0?"x":"y"}function Me(t,e,i){return Ae(t,Ee(e,i))}function Fe(t){return Object.assign({},{top:0,right:0,bottom:0,left:0},t)}function He(t,e){return e.reduce(function(e,i){return e[i]=t,e},{})}const We={name:"arrow",enabled:!0,phase:"main",fn:function(t){var e,i=t.state,n=t.name,s=t.options,o=i.elements.arrow,r=i.modifiersData.popperOffsets,a=we(i.placement),l=je(a),c=[Xt,Qt].indexOf(a)>=0?"height":"width";if(o&&r){var h=function(t,e){return Fe("number"!=typeof(t="function"==typeof t?t(Object.assign({},e.rects,{placement:e.placement})):t)?t:He(t,Ut))}(s.padding,i),d=ke(o),u="y"===l?Vt:Xt,f="y"===l?Kt:Qt,p=i.rects.reference[c]+i.rects.reference[l]-r[l]-i.rects.popper[c],m=r[l]-i.rects.reference[l],g=Pe(o),_=g?"y"===l?g.clientHeight||0:g.clientWidth||0:0,b=p/2-m/2,v=h[u],y=_-d[c]-h[f],w=_/2-d[c]/2+b,A=Me(v,w,y),E=l;i.modifiersData[n]=((e={})[E]=A,e.centerOffset=A-w,e);}},effect:function(t){var e=t.state,i=t.options.element,n=void 0===i?"[data-popper-arrow]":i;null!=n&&("string"!=typeof n||(n=e.elements.popper.querySelector(n)))&&Le(e.elements.popper,n)&&(e.elements.arrow=n);},requires:["popperOffsets"],requiresIfExists:["preventOverflow"]};function Be(t){return t.split("-")[1]}var ze={top:"auto",right:"auto",bottom:"auto",left:"auto"};function Re(t){var e,i=t.popper,n=t.popperRect,s=t.placement,o=t.variation,r=t.offsets,a=t.position,l=t.gpuAcceleration,c=t.adaptive,h=t.roundOffsets,d=t.isFixed,u=r.x,f=void 0===u?0:u,p=r.y,m=void 0===p?0:p,g="function"==typeof h?h({x:f,y:m}):{x:f,y:m};f=g.x,m=g.y;var _=r.hasOwnProperty("x"),b=r.hasOwnProperty("y"),v=Xt,y=Vt,w=window;if(c){var A=Pe(i),E="clientHeight",T="clientWidth";A===ge(i)&&"static"!==Se(A=$e(i)).position&&"absolute"===a&&(E="scrollHeight",T="scrollWidth"),(s===Vt||(s===Xt||s===Qt)&&o===Jt)&&(y=Kt,m-=(d&&A===w&&w.visualViewport?w.visualViewport.height:A[E])-n.height,m*=l?1:-1),s!==Xt&&(s!==Vt&&s!==Kt||o!==Jt)||(v=Qt,f-=(d&&A===w&&w.visualViewport?w.visualViewport.width:A[T])-n.width,f*=l?1:-1);}var C,O=Object.assign({position:a},c&&ze),x=!0===h?function(t,e){var i=t.x,n=t.y,s=e.devicePixelRatio||1;return {x:Te(i*s)/s||0,y:Te(n*s)/s||0}}({x:f,y:m},ge(i)):{x:f,y:m};return f=x.x,m=x.y,l?Object.assign({},O,((C={})[y]=b?"0":"",C[v]=_?"0":"",C.transform=(w.devicePixelRatio||1)<=1?"translate("+f+"px, "+m+"px)":"translate3d("+f+"px, "+m+"px, 0)",C)):Object.assign({},O,((e={})[y]=b?m+"px":"",e[v]=_?f+"px":"",e.transform="",e))}const qe={name:"computeStyles",enabled:!0,phase:"beforeWrite",fn:function(t){var e=t.state,i=t.options,n=i.gpuAcceleration,s=void 0===n||n,o=i.adaptive,r=void 0===o||o,a=i.roundOffsets,l=void 0===a||a,c={placement:we(e.placement),variation:Be(e.placement),popper:e.elements.popper,popperRect:e.rects.popper,gpuAcceleration:s,isFixed:"fixed"===e.options.strategy};null!=e.modifiersData.popperOffsets&&(e.styles.popper=Object.assign({},e.styles.popper,Re(Object.assign({},c,{offsets:e.modifiersData.popperOffsets,position:e.options.strategy,adaptive:r,roundOffsets:l})))),null!=e.modifiersData.arrow&&(e.styles.arrow=Object.assign({},e.styles.arrow,Re(Object.assign({},c,{offsets:e.modifiersData.arrow,position:"absolute",adaptive:!1,roundOffsets:l})))),e.attributes.popper=Object.assign({},e.attributes.popper,{"data-popper-placement":e.placement});},data:{}};var Ve={passive:!0};const Ke={name:"eventListeners",enabled:!0,phase:"write",fn:function(){},effect:function(t){var e=t.state,i=t.instance,n=t.options,s=n.scroll,o=void 0===s||s,r=n.resize,a=void 0===r||r,l=ge(e.elements.popper),c=[].concat(e.scrollParents.reference,e.scrollParents.popper);return o&&c.forEach(function(t){t.addEventListener("scroll",i.update,Ve);}),a&&l.addEventListener("resize",i.update,Ve),function(){o&&c.forEach(function(t){t.removeEventListener("scroll",i.update,Ve);}),a&&l.removeEventListener("resize",i.update,Ve);}},data:{}};var Qe={left:"right",right:"left",bottom:"top",top:"bottom"};function Xe(t){return t.replace(/left|right|bottom|top/g,function(t){return Qe[t]})}var Ye={start:"end",end:"start"};function Ue(t){return t.replace(/start|end/g,function(t){return Ye[t]})}function Ge(t){var e=ge(t);return {scrollLeft:e.pageXOffset,scrollTop:e.pageYOffset}}function Je(t){return xe($e(t)).left+Ge(t).scrollLeft}function Ze(t){var e=Se(t),i=e.overflow,n=e.overflowX,s=e.overflowY;return /auto|scroll|overlay|hidden/.test(i+s+n)}function ti(t){return ["html","body","#document"].indexOf(me(t))>=0?t.ownerDocument.body:be(t)&&Ze(t)?t:ti(Ie(t))}function ei(t,e){var i;void 0===e&&(e=[]);var n=ti(t),s=n===(null==(i=t.ownerDocument)?void 0:i.body),o=ge(n),r=s?[o].concat(o.visualViewport||[],Ze(n)?n:[]):n,a=e.concat(r);return s?a:a.concat(ei(Ie(r)))}function ii(t){return Object.assign({},t,{left:t.x,top:t.y,right:t.x+t.width,bottom:t.y+t.height})}function ni(t,e,i){return e===te?ii(function(t,e){var i=ge(t),n=$e(t),s=i.visualViewport,o=n.clientWidth,r=n.clientHeight,a=0,l=0;if(s){o=s.width,r=s.height;var c=Oe();(c||!c&&"fixed"===e)&&(a=s.offsetLeft,l=s.offsetTop);}return {width:o,height:r,x:a+Je(t),y:l}}(t,i)):_e(e)?function(t,e){var i=xe(t,!1,"fixed"===e);return i.top=i.top+t.clientTop,i.left=i.left+t.clientLeft,i.bottom=i.top+t.clientHeight,i.right=i.left+t.clientWidth,i.width=t.clientWidth,i.height=t.clientHeight,i.x=i.left,i.y=i.top,i}(e,i):ii(function(t){var e,i=$e(t),n=Ge(t),s=null==(e=t.ownerDocument)?void 0:e.body,o=Ae(i.scrollWidth,i.clientWidth,s?s.scrollWidth:0,s?s.clientWidth:0),r=Ae(i.scrollHeight,i.clientHeight,s?s.scrollHeight:0,s?s.clientHeight:0),a=-n.scrollLeft+Je(t),l=-n.scrollTop;return "rtl"===Se(s||i).direction&&(a+=Ae(i.clientWidth,s?s.clientWidth:0)-o),{width:o,height:r,x:a,y:l}}($e(t)))}function si(t){var e,i=t.reference,n=t.element,s=t.placement,o=s?we(s):null,r=s?Be(s):null,a=i.x+i.width/2-n.width/2,l=i.y+i.height/2-n.height/2;switch(o){case Vt:e={x:a,y:i.y-n.height};break;case Kt:e={x:a,y:i.y+i.height};break;case Qt:e={x:i.x+i.width,y:l};break;case Xt:e={x:i.x-n.width,y:l};break;default:e={x:i.x,y:i.y};}var c=o?je(o):null;if(null!=c){var h="y"===c?"height":"width";switch(r){case Gt:e[c]=e[c]-(i[h]/2-n[h]/2);break;case Jt:e[c]=e[c]+(i[h]/2-n[h]/2);}}return e}function oi(t,e){void 0===e&&(e={});var i=e,n=i.placement,s=void 0===n?t.placement:n,o=i.strategy,r=void 0===o?t.strategy:o,a=i.boundary,l=void 0===a?Zt:a,c=i.rootBoundary,h=void 0===c?te:c,d=i.elementContext,u=void 0===d?ee:d,f=i.altBoundary,p=void 0!==f&&f,m=i.padding,g=void 0===m?0:m,_=Fe("number"!=typeof g?g:He(g,Ut)),b=u===ee?ie:ee,v=t.rects.popper,y=t.elements[p?b:u],w=function(t,e,i,n){var s="clippingParents"===e?function(t){var e=ei(Ie(t)),i=["absolute","fixed"].indexOf(Se(t).position)>=0&&be(t)?Pe(t):t;return _e(i)?e.filter(function(t){return _e(t)&&Le(t,i)&&"body"!==me(t)}):[]}(t):[].concat(e),o=[].concat(s,[i]),r=o[0],a=o.reduce(function(e,i){var s=ni(t,i,n);return e.top=Ae(s.top,e.top),e.right=Ee(s.right,e.right),e.bottom=Ee(s.bottom,e.bottom),e.left=Ae(s.left,e.left),e},ni(t,r,n));return a.width=a.right-a.left,a.height=a.bottom-a.top,a.x=a.left,a.y=a.top,a}(_e(y)?y:y.contextElement||$e(t.elements.popper),l,h,r),A=xe(t.elements.reference),E=si({reference:A,element:v,placement:s}),T=ii(Object.assign({},v,E)),C=u===ee?T:A,O={top:w.top-C.top+_.top,bottom:C.bottom-w.bottom+_.bottom,left:w.left-C.left+_.left,right:C.right-w.right+_.right},x=t.modifiersData.offset;if(u===ee&&x){var k=x[s];Object.keys(O).forEach(function(t){var e=[Qt,Kt].indexOf(t)>=0?1:-1,i=[Vt,Kt].indexOf(t)>=0?"y":"x";O[t]+=k[i]*e;});}return O}function ri(t,e){void 0===e&&(e={});var i=e,n=i.placement,s=i.boundary,o=i.rootBoundary,r=i.padding,a=i.flipVariations,l=i.allowedAutoPlacements,c=void 0===l?se:l,h=Be(n),d=h?a?ne:ne.filter(function(t){return Be(t)===h}):Ut,u=d.filter(function(t){return c.indexOf(t)>=0});0===u.length&&(u=d);var f=u.reduce(function(e,i){return e[i]=oi(t,{placement:i,boundary:s,rootBoundary:o,padding:r})[we(i)],e},{});return Object.keys(f).sort(function(t,e){return f[t]-f[e]})}const ai={name:"flip",enabled:!0,phase:"main",fn:function(t){var e=t.state,i=t.options,n=t.name;if(!e.modifiersData[n]._skip){for(var s=i.mainAxis,o=void 0===s||s,r=i.altAxis,a=void 0===r||r,l=i.fallbackPlacements,c=i.padding,h=i.boundary,d=i.rootBoundary,u=i.altBoundary,f=i.flipVariations,p=void 0===f||f,m=i.allowedAutoPlacements,g=e.options.placement,_=we(g),b=l||(_!==g&&p?function(t){if(we(t)===Yt)return [];var e=Xe(t);return [Ue(t),e,Ue(e)]}(g):[Xe(g)]),v=[g].concat(b).reduce(function(t,i){return t.concat(we(i)===Yt?ri(e,{placement:i,boundary:h,rootBoundary:d,padding:c,flipVariations:p,allowedAutoPlacements:m}):i)},[]),y=e.rects.reference,w=e.rects.popper,A=new Map,E=!0,T=v[0],C=0;C<v.length;C++){var O=v[C],x=we(O),k=Be(O)===Gt,L=[Vt,Kt].indexOf(x)>=0,S=L?"width":"height",D=oi(e,{placement:O,boundary:h,rootBoundary:d,altBoundary:u,padding:c}),$=L?k?Qt:Xt:k?Kt:Vt;y[S]>w[S]&&($=Xe($));var I=Xe($),N=[];if(o&&N.push(D[x]<=0),a&&N.push(D[$]<=0,D[I]<=0),N.every(function(t){return t})){T=O,E=!1;break}A.set(O,N);}if(E)for(var P=function(t){var e=v.find(function(e){var i=A.get(e);if(i)return i.slice(0,t).every(function(t){return t})});if(e)return T=e,"break"},j=p?3:1;j>0&&"break"!==P(j);j--);e.placement!==T&&(e.modifiersData[n]._skip=!0,e.placement=T,e.reset=!0);}},requiresIfExists:["offset"],data:{_skip:!1}};function li(t,e,i){return void 0===i&&(i={x:0,y:0}),{top:t.top-e.height-i.y,right:t.right-e.width+i.x,bottom:t.bottom-e.height+i.y,left:t.left-e.width-i.x}}function ci(t){return [Vt,Qt,Kt,Xt].some(function(e){return t[e]>=0})}const hi={name:"hide",enabled:!0,phase:"main",requiresIfExists:["preventOverflow"],fn:function(t){var e=t.state,i=t.name,n=e.rects.reference,s=e.rects.popper,o=e.modifiersData.preventOverflow,r=oi(e,{elementContext:"reference"}),a=oi(e,{altBoundary:!0}),l=li(r,n),c=li(a,s,o),h=ci(l),d=ci(c);e.modifiersData[i]={referenceClippingOffsets:l,popperEscapeOffsets:c,isReferenceHidden:h,hasPopperEscaped:d},e.attributes.popper=Object.assign({},e.attributes.popper,{"data-popper-reference-hidden":h,"data-popper-escaped":d});}},di={name:"offset",enabled:!0,phase:"main",requires:["popperOffsets"],fn:function(t){var e=t.state,i=t.options,n=t.name,s=i.offset,o=void 0===s?[0,0]:s,r=se.reduce(function(t,i){return t[i]=function(t,e,i){var n=we(t),s=[Xt,Vt].indexOf(n)>=0?-1:1,o="function"==typeof i?i(Object.assign({},e,{placement:t})):i,r=o[0],a=o[1];return r=r||0,a=(a||0)*s,[Xt,Qt].indexOf(n)>=0?{x:a,y:r}:{x:r,y:a}}(i,e.rects,o),t},{}),a=r[e.placement],l=a.x,c=a.y;null!=e.modifiersData.popperOffsets&&(e.modifiersData.popperOffsets.x+=l,e.modifiersData.popperOffsets.y+=c),e.modifiersData[n]=r;}},ui={name:"popperOffsets",enabled:!0,phase:"read",fn:function(t){var e=t.state,i=t.name;e.modifiersData[i]=si({reference:e.rects.reference,element:e.rects.popper,placement:e.placement});},data:{}},fi={name:"preventOverflow",enabled:!0,phase:"main",fn:function(t){var e=t.state,i=t.options,n=t.name,s=i.mainAxis,o=void 0===s||s,r=i.altAxis,a=void 0!==r&&r,l=i.boundary,c=i.rootBoundary,h=i.altBoundary,d=i.padding,u=i.tether,f=void 0===u||u,p=i.tetherOffset,m=void 0===p?0:p,g=oi(e,{boundary:l,rootBoundary:c,padding:d,altBoundary:h}),_=we(e.placement),b=Be(e.placement),v=!b,y=je(_),w="x"===y?"y":"x",A=e.modifiersData.popperOffsets,E=e.rects.reference,T=e.rects.popper,C="function"==typeof m?m(Object.assign({},e.rects,{placement:e.placement})):m,O="number"==typeof C?{mainAxis:C,altAxis:C}:Object.assign({mainAxis:0,altAxis:0},C),x=e.modifiersData.offset?e.modifiersData.offset[e.placement]:null,k={x:0,y:0};if(A){if(o){var L,S="y"===y?Vt:Xt,D="y"===y?Kt:Qt,$="y"===y?"height":"width",I=A[y],N=I+g[S],P=I-g[D],j=f?-T[$]/2:0,M=b===Gt?E[$]:T[$],F=b===Gt?-T[$]:-E[$],H=e.elements.arrow,W=f&&H?ke(H):{width:0,height:0},B=e.modifiersData["arrow#persistent"]?e.modifiersData["arrow#persistent"].padding:{top:0,right:0,bottom:0,left:0},z=B[S],R=B[D],q=Me(0,E[$],W[$]),V=v?E[$]/2-j-q-z-O.mainAxis:M-q-z-O.mainAxis,K=v?-E[$]/2+j+q+R+O.mainAxis:F+q+R+O.mainAxis,Q=e.elements.arrow&&Pe(e.elements.arrow),X=Q?"y"===y?Q.clientTop||0:Q.clientLeft||0:0,Y=null!=(L=null==x?void 0:x[y])?L:0,U=I+K-Y,G=Me(f?Ee(N,I+V-Y-X):N,I,f?Ae(P,U):P);A[y]=G,k[y]=G-I;}if(a){var J,Z="x"===y?Vt:Xt,tt="x"===y?Kt:Qt,et=A[w],it="y"===w?"height":"width",nt=et+g[Z],st=et-g[tt],ot=-1!==[Vt,Xt].indexOf(_),rt=null!=(J=null==x?void 0:x[w])?J:0,at=ot?nt:et-E[it]-T[it]-rt+O.altAxis,lt=ot?et+E[it]+T[it]-rt-O.altAxis:st,ct=f&&ot?function(t,e,i){var n=Me(t,e,i);return n>i?i:n}(at,et,lt):Me(f?at:nt,et,f?lt:st);A[w]=ct,k[w]=ct-et;}e.modifiersData[n]=k;}},requiresIfExists:["offset"]};function pi(t,e,i){void 0===i&&(i=!1);var n,s,o=be(e),r=be(e)&&function(t){var e=t.getBoundingClientRect(),i=Te(e.width)/t.offsetWidth||1,n=Te(e.height)/t.offsetHeight||1;return 1!==i||1!==n}(e),a=$e(e),l=xe(t,r,i),c={scrollLeft:0,scrollTop:0},h={x:0,y:0};return (o||!o&&!i)&&(("body"!==me(e)||Ze(a))&&(c=(n=e)!==ge(n)&&be(n)?{scrollLeft:(s=n).scrollLeft,scrollTop:s.scrollTop}:Ge(n)),be(e)?((h=xe(e,!0)).x+=e.clientLeft,h.y+=e.clientTop):a&&(h.x=Je(a))),{x:l.left+c.scrollLeft-h.x,y:l.top+c.scrollTop-h.y,width:l.width,height:l.height}}function mi(t){var e=new Map,i=new Set,n=[];function s(t){i.add(t.name),[].concat(t.requires||[],t.requiresIfExists||[]).forEach(function(t){if(!i.has(t)){var n=e.get(t);n&&s(n);}}),n.push(t);}return t.forEach(function(t){e.set(t.name,t);}),t.forEach(function(t){i.has(t.name)||s(t);}),n}var gi={placement:"bottom",modifiers:[],strategy:"absolute"};function _i(){for(var t=arguments.length,e=new Array(t),i=0;i<t;i++)e[i]=arguments[i];return !e.some(function(t){return !(t&&"function"==typeof t.getBoundingClientRect)})}function bi(t){void 0===t&&(t={});var e=t,i=e.defaultModifiers,n=void 0===i?[]:i,s=e.defaultOptions,o=void 0===s?gi:s;return function(t,e,i){void 0===i&&(i=o);var s,r,a={placement:"bottom",orderedModifiers:[],options:Object.assign({},gi,o),modifiersData:{},elements:{reference:t,popper:e},attributes:{},styles:{}},l=[],c=!1,h={state:a,setOptions:function(i){var s="function"==typeof i?i(a.options):i;d(),a.options=Object.assign({},o,a.options,s),a.scrollParents={reference:_e(t)?ei(t):t.contextElement?ei(t.contextElement):[],popper:ei(e)};var r,c,u=function(t){var e=mi(t);return pe.reduce(function(t,i){return t.concat(e.filter(function(t){return t.phase===i}))},[])}((r=[].concat(n,a.options.modifiers),c=r.reduce(function(t,e){var i=t[e.name];return t[e.name]=i?Object.assign({},i,e,{options:Object.assign({},i.options,e.options),data:Object.assign({},i.data,e.data)}):e,t},{}),Object.keys(c).map(function(t){return c[t]})));return a.orderedModifiers=u.filter(function(t){return t.enabled}),a.orderedModifiers.forEach(function(t){var e=t.name,i=t.options,n=void 0===i?{}:i,s=t.effect;if("function"==typeof s){var o=s({state:a,name:e,instance:h,options:n});l.push(o||function(){});}}),h.update()},forceUpdate:function(){if(!c){var t=a.elements,e=t.reference,i=t.popper;if(_i(e,i)){a.rects={reference:pi(e,Pe(i),"fixed"===a.options.strategy),popper:ke(i)},a.reset=!1,a.placement=a.options.placement,a.orderedModifiers.forEach(function(t){return a.modifiersData[t.name]=Object.assign({},t.data)});for(var n=0;n<a.orderedModifiers.length;n++)if(!0!==a.reset){var s=a.orderedModifiers[n],o=s.fn,r=s.options,l=void 0===r?{}:r,d=s.name;"function"==typeof o&&(a=o({state:a,options:l,name:d,instance:h})||a);}else a.reset=!1,n=-1;}}},update:(s=function(){return new Promise(function(t){h.forceUpdate(),t(a);})},function(){return r||(r=new Promise(function(t){Promise.resolve().then(function(){r=void 0,t(s());});})),r}),destroy:function(){d(),c=!0;}};if(!_i(t,e))return h;function d(){l.forEach(function(t){return t()}),l=[];}return h.setOptions(i).then(function(t){!c&&i.onFirstUpdate&&i.onFirstUpdate(t);}),h}}var vi=bi(),yi=bi({defaultModifiers:[Ke,ui,qe,ye]}),wi=bi({defaultModifiers:[Ke,ui,qe,ye,di,ai,fi,We,hi]});const Ai=Object.freeze(Object.defineProperty({__proto__:null,afterMain:he,afterRead:ae,afterWrite:fe,applyStyles:ye,arrow:We,auto:Yt,basePlacements:Ut,beforeMain:le,beforeRead:oe,beforeWrite:de,bottom:Kt,clippingParents:Zt,computeStyles:qe,createPopper:wi,createPopperBase:vi,createPopperLite:yi,detectOverflow:oi,end:Jt,eventListeners:Ke,flip:ai,hide:hi,left:Xt,main:ce,modifierPhases:pe,offset:di,placements:se,popper:ee,popperGenerator:bi,popperOffsets:ui,preventOverflow:fi,read:re,reference:ie,right:Qt,start:Gt,top:Vt,variationPlacements:ne,viewport:te,write:ue},Symbol.toStringTag,{value:"Module"})),Ei="dropdown",Ti=".bs.dropdown",Ci=".data-api",Oi="ArrowUp",xi="ArrowDown",ki=`hide${Ti}`,Li=`hidden${Ti}`,Si=`show${Ti}`,Di=`shown${Ti}`,$i=`click${Ti}${Ci}`,Ii=`keydown${Ti}${Ci}`,Ni=`keyup${Ti}${Ci}`,Pi="show",ji='[data-bs-toggle="dropdown"]:not(.disabled):not(:disabled)',Mi=`${ji}.${Pi}`,Fi=".dropdown-menu",Hi=m()?"top-end":"top-start",Wi=m()?"top-start":"top-end",Bi=m()?"bottom-end":"bottom-start",zi=m()?"bottom-start":"bottom-end",Ri=m()?"left-start":"right-start",qi=m()?"right-start":"left-start",Vi={autoClose:!0,boundary:"clippingParents",display:"dynamic",offset:[0,2],popperConfig:null,reference:"toggle"},Ki={autoClose:"(boolean|string)",boundary:"(string|element)",display:"string",offset:"(array|string|function)",popperConfig:"(null|object|function)",reference:"(string|element|object)"};class Qi extends B{constructor(t,e){super(t,e),this._popper=null,this._parent=this._element.parentNode,this._menu=R.next(this._element,Fi)[0]||R.prev(this._element,Fi)[0]||R.findOne(Fi,this._parent),this._inNavbar=this._detectNavbar();}static get Default(){return Vi}static get DefaultType(){return Ki}static get NAME(){return Ei}toggle(){return this._isShown()?this.hide():this.show()}show(){if(c(this._element)||this._isShown())return;const t={relatedTarget:this._element};if(!P.trigger(this._element,Si,t).defaultPrevented){if(this._createPopper(),"ontouchstart"in document.documentElement&&!this._parent.closest(".navbar-nav"))for(const t of [].concat(...document.body.children))P.on(t,"mouseover",d);this._element.focus(),this._element.setAttribute("aria-expanded",!0),this._menu.classList.add(Pi),this._element.classList.add(Pi),P.trigger(this._element,Di,t);}}hide(){if(c(this._element)||!this._isShown())return;const t={relatedTarget:this._element};this._completeHide(t);}dispose(){this._popper&&this._popper.destroy(),super.dispose();}update(){this._inNavbar=this._detectNavbar(),this._popper&&this._popper.update();}_completeHide(t){if(!P.trigger(this._element,ki,t).defaultPrevented){if("ontouchstart"in document.documentElement)for(const t of [].concat(...document.body.children))P.off(t,"mouseover",d);this._popper&&this._popper.destroy(),this._menu.classList.remove(Pi),this._element.classList.remove(Pi),this._element.setAttribute("aria-expanded","false"),H.removeDataAttribute(this._menu,"popper"),P.trigger(this._element,Li,t);}}_getConfig(t){if("object"==typeof(t=super._getConfig(t)).reference&&!r(t.reference)&&"function"!=typeof t.reference.getBoundingClientRect)throw new TypeError(`${Ei.toUpperCase()}: Option "reference" provided type "object" without a required "getBoundingClientRect" method.`);return t}_createPopper(){if(void 0===Ai)throw new TypeError("Bootstrap's dropdowns require Popper (https://popper.js.org/docs/v2/)");let t=this._element;"parent"===this._config.reference?t=this._parent:r(this._config.reference)?t=a(this._config.reference):"object"==typeof this._config.reference&&(t=this._config.reference);const e=this._getPopperConfig();this._popper=wi(t,this._menu,e);}_isShown(){return this._menu.classList.contains(Pi)}_getPlacement(){const t=this._parent;if(t.classList.contains("dropend"))return Ri;if(t.classList.contains("dropstart"))return qi;if(t.classList.contains("dropup-center"))return "top";if(t.classList.contains("dropdown-center"))return "bottom";const e="end"===getComputedStyle(this._menu).getPropertyValue("--bs-position").trim();return t.classList.contains("dropup")?e?Wi:Hi:e?zi:Bi}_detectNavbar(){return null!==this._element.closest(".navbar")}_getOffset(){const{offset:t}=this._config;return "string"==typeof t?t.split(",").map(t=>Number.parseInt(t,10)):"function"==typeof t?e=>t(e,this._element):t}_getPopperConfig(){const t={placement:this._getPlacement(),modifiers:[{name:"preventOverflow",options:{boundary:this._config.boundary}},{name:"offset",options:{offset:this._getOffset()}}]};return (this._inNavbar||"static"===this._config.display)&&(H.setDataAttribute(this._menu,"popper","static"),t.modifiers=[{name:"applyStyles",enabled:!1}]),{...t,..._(this._config.popperConfig,[void 0,t])}}_selectMenuItem({key:t,target:e}){const i=R.find(".dropdown-menu .dropdown-item:not(.disabled):not(:disabled)",this._menu).filter(t=>l(t));i.length&&v(i,e,t===xi,!i.includes(e)).focus();}static jQueryInterface(t){return this.each(function(){const e=Qi.getOrCreateInstance(this,t);if("string"==typeof t){if(void 0===e[t])throw new TypeError(`No method named "${t}"`);e[t]();}})}static clearMenus(t){if(2===t.button||"keyup"===t.type&&"Tab"!==t.key)return;const e=R.find(Mi);for(const i of e){const e=Qi.getInstance(i);if(!e||!1===e._config.autoClose)continue;const n=t.composedPath(),s=n.includes(e._menu);if(n.includes(e._element)||"inside"===e._config.autoClose&&!s||"outside"===e._config.autoClose&&s)continue;if(e._menu.contains(t.target)&&("keyup"===t.type&&"Tab"===t.key||/input|select|option|textarea|form/i.test(t.target.tagName)))continue;const o={relatedTarget:e._element};"click"===t.type&&(o.clickEvent=t),e._completeHide(o);}}static dataApiKeydownHandler(t){const e=/input|textarea/i.test(t.target.tagName),i="Escape"===t.key,n=[Oi,xi].includes(t.key);if(!n&&!i)return;if(e&&!i)return;t.preventDefault();const s=this.matches(ji)?this:R.prev(this,ji)[0]||R.next(this,ji)[0]||R.findOne(ji,t.delegateTarget.parentNode),o=Qi.getOrCreateInstance(s);if(n)return t.stopPropagation(),o.show(),void o._selectMenuItem(t);o._isShown()&&(t.stopPropagation(),o.hide(),s.focus());}}P.on(document,Ii,ji,Qi.dataApiKeydownHandler),P.on(document,Ii,Fi,Qi.dataApiKeydownHandler),P.on(document,$i,Qi.clearMenus),P.on(document,Ni,Qi.clearMenus),P.on(document,$i,ji,function(t){t.preventDefault(),Qi.getOrCreateInstance(this).toggle();}),g(Qi);const Xi="backdrop",Yi="show",Ui=`mousedown.bs.${Xi}`,Gi={className:"modal-backdrop",clickCallback:null,isAnimated:!1,isVisible:!0,rootElement:"body"},Ji={className:"string",clickCallback:"(function|null)",isAnimated:"boolean",isVisible:"boolean",rootElement:"(element|string)"};class Zi extends W{constructor(t){super(),this._config=this._getConfig(t),this._isAppended=!1,this._element=null;}static get Default(){return Gi}static get DefaultType(){return Ji}static get NAME(){return Xi}show(t){if(!this._config.isVisible)return void _(t);this._append();const e=this._getElement();this._config.isAnimated&&u(e),e.classList.add(Yi),this._emulateAnimation(()=>{_(t);});}hide(t){this._config.isVisible?(this._getElement().classList.remove(Yi),this._emulateAnimation(()=>{this.dispose(),_(t);})):_(t);}dispose(){this._isAppended&&(P.off(this._element,Ui),this._element.remove(),this._isAppended=!1);}_getElement(){if(!this._element){const t=document.createElement("div");t.className=this._config.className,this._config.isAnimated&&t.classList.add("fade"),this._element=t;}return this._element}_configAfterMerge(t){return t.rootElement=a(t.rootElement),t}_append(){if(this._isAppended)return;const t=this._getElement();this._config.rootElement.append(t),P.on(t,Ui,()=>{_(this._config.clickCallback);}),this._isAppended=!0;}_emulateAnimation(t){b(t,this._getElement(),this._config.isAnimated);}}const tn=".bs.focustrap",en=`focusin${tn}`,nn=`keydown.tab${tn}`,sn="backward",on={autofocus:!0,trapElement:null},rn={autofocus:"boolean",trapElement:"element"};class an extends W{constructor(t){super(),this._config=this._getConfig(t),this._isActive=!1,this._lastTabNavDirection=null;}static get Default(){return on}static get DefaultType(){return rn}static get NAME(){return "focustrap"}activate(){this._isActive||(this._config.autofocus&&this._config.trapElement.focus(),P.off(document,tn),P.on(document,en,t=>this._handleFocusin(t)),P.on(document,nn,t=>this._handleKeydown(t)),this._isActive=!0);}deactivate(){this._isActive&&(this._isActive=!1,P.off(document,tn));}_handleFocusin(t){const{trapElement:e}=this._config;if(t.target===document||t.target===e||e.contains(t.target))return;const i=R.focusableChildren(e);0===i.length?e.focus():this._lastTabNavDirection===sn?i[i.length-1].focus():i[0].focus();}_handleKeydown(t){"Tab"===t.key&&(this._lastTabNavDirection=t.shiftKey?sn:"forward");}}const ln=".fixed-top, .fixed-bottom, .is-fixed, .sticky-top",cn=".sticky-top",hn="padding-right",dn="margin-right";class un{constructor(){this._element=document.body;}getWidth(){const t=document.documentElement.clientWidth;return Math.abs(window.innerWidth-t)}hide(){const t=this.getWidth();this._disableOverFlow(),this._setElementAttributes(this._element,hn,e=>e+t),this._setElementAttributes(ln,hn,e=>e+t),this._setElementAttributes(cn,dn,e=>e-t);}reset(){this._resetElementAttributes(this._element,"overflow"),this._resetElementAttributes(this._element,hn),this._resetElementAttributes(ln,hn),this._resetElementAttributes(cn,dn);}isOverflowing(){return this.getWidth()>0}_disableOverFlow(){this._saveInitialAttribute(this._element,"overflow"),this._element.style.overflow="hidden";}_setElementAttributes(t,e,i){const n=this.getWidth();this._applyManipulationCallback(t,t=>{if(t!==this._element&&window.innerWidth>t.clientWidth+n)return;this._saveInitialAttribute(t,e);const s=window.getComputedStyle(t).getPropertyValue(e);t.style.setProperty(e,`${i(Number.parseFloat(s))}px`);});}_saveInitialAttribute(t,e){const i=t.style.getPropertyValue(e);i&&H.setDataAttribute(t,e,i);}_resetElementAttributes(t,e){this._applyManipulationCallback(t,t=>{const i=H.getDataAttribute(t,e);null!==i?(H.removeDataAttribute(t,e),t.style.setProperty(e,i)):t.style.removeProperty(e);});}_applyManipulationCallback(t,e){if(r(t))e(t);else for(const i of R.find(t,this._element))e(i);}}const fn=".bs.modal",pn=`hide${fn}`,mn=`hidePrevented${fn}`,gn=`hidden${fn}`,_n=`show${fn}`,bn=`shown${fn}`,vn=`resize${fn}`,yn=`click.dismiss${fn}`,wn=`mousedown.dismiss${fn}`,An=`keydown.dismiss${fn}`,En=`click${fn}.data-api`,Tn="modal-open",Cn="show",On="modal-static",xn={backdrop:!0,focus:!0,keyboard:!0},kn={backdrop:"(boolean|string)",focus:"boolean",keyboard:"boolean"};class Ln extends B{constructor(t,e){super(t,e),this._dialog=R.findOne(".modal-dialog",this._element),this._backdrop=this._initializeBackDrop(),this._focustrap=this._initializeFocusTrap(),this._isShown=!1,this._isTransitioning=!1,this._scrollBar=new un,this._addEventListeners();}static get Default(){return xn}static get DefaultType(){return kn}static get NAME(){return "modal"}toggle(t){return this._isShown?this.hide():this.show(t)}show(t){this._isShown||this._isTransitioning||P.trigger(this._element,_n,{relatedTarget:t}).defaultPrevented||(this._isShown=!0,this._isTransitioning=!0,this._scrollBar.hide(),document.body.classList.add(Tn),this._adjustDialog(),this._backdrop.show(()=>this._showElement(t)));}hide(){this._isShown&&!this._isTransitioning&&(P.trigger(this._element,pn).defaultPrevented||(this._isShown=!1,this._isTransitioning=!0,this._focustrap.deactivate(),this._element.classList.remove(Cn),this._queueCallback(()=>this._hideModal(),this._element,this._isAnimated())));}dispose(){P.off(window,fn),P.off(this._dialog,fn),this._backdrop.dispose(),this._focustrap.deactivate(),super.dispose();}handleUpdate(){this._adjustDialog();}_initializeBackDrop(){return new Zi({isVisible:Boolean(this._config.backdrop),isAnimated:this._isAnimated()})}_initializeFocusTrap(){return new an({trapElement:this._element})}_showElement(t){document.body.contains(this._element)||document.body.append(this._element),this._element.style.display="block",this._element.removeAttribute("aria-hidden"),this._element.setAttribute("aria-modal",!0),this._element.setAttribute("role","dialog"),this._element.scrollTop=0;const e=R.findOne(".modal-body",this._dialog);e&&(e.scrollTop=0),u(this._element),this._element.classList.add(Cn),this._queueCallback(()=>{this._config.focus&&this._focustrap.activate(),this._isTransitioning=!1,P.trigger(this._element,bn,{relatedTarget:t});},this._dialog,this._isAnimated());}_addEventListeners(){P.on(this._element,An,t=>{"Escape"===t.key&&(this._config.keyboard?this.hide():this._triggerBackdropTransition());}),P.on(window,vn,()=>{this._isShown&&!this._isTransitioning&&this._adjustDialog();}),P.on(this._element,wn,t=>{P.one(this._element,yn,e=>{this._element===t.target&&this._element===e.target&&("static"!==this._config.backdrop?this._config.backdrop&&this.hide():this._triggerBackdropTransition());});});}_hideModal(){this._element.style.display="none",this._element.setAttribute("aria-hidden",!0),this._element.removeAttribute("aria-modal"),this._element.removeAttribute("role"),this._isTransitioning=!1,this._backdrop.hide(()=>{document.body.classList.remove(Tn),this._resetAdjustments(),this._scrollBar.reset(),P.trigger(this._element,gn);});}_isAnimated(){return this._element.classList.contains("fade")}_triggerBackdropTransition(){if(P.trigger(this._element,mn).defaultPrevented)return;const t=this._element.scrollHeight>document.documentElement.clientHeight,e=this._element.style.overflowY;"hidden"===e||this._element.classList.contains(On)||(t||(this._element.style.overflowY="hidden"),this._element.classList.add(On),this._queueCallback(()=>{this._element.classList.remove(On),this._queueCallback(()=>{this._element.style.overflowY=e;},this._dialog);},this._dialog),this._element.focus());}_adjustDialog(){const t=this._element.scrollHeight>document.documentElement.clientHeight,e=this._scrollBar.getWidth(),i=e>0;if(i&&!t){const t=m()?"paddingLeft":"paddingRight";this._element.style[t]=`${e}px`;}if(!i&&t){const t=m()?"paddingRight":"paddingLeft";this._element.style[t]=`${e}px`;}}_resetAdjustments(){this._element.style.paddingLeft="",this._element.style.paddingRight="";}static jQueryInterface(t,e){return this.each(function(){const i=Ln.getOrCreateInstance(this,t);if("string"==typeof t){if(void 0===i[t])throw new TypeError(`No method named "${t}"`);i[t](e);}})}}P.on(document,En,'[data-bs-toggle="modal"]',function(t){const e=R.getElementFromSelector(this);["A","AREA"].includes(this.tagName)&&t.preventDefault(),P.one(e,_n,t=>{t.defaultPrevented||P.one(e,gn,()=>{l(this)&&this.focus();});});const i=R.findOne(".modal.show");i&&Ln.getInstance(i).hide(),Ln.getOrCreateInstance(e).toggle(this);}),q(Ln),g(Ln);const Sn=".bs.offcanvas",Dn=".data-api",$n=`load${Sn}${Dn}`,In="show",Nn="showing",Pn="hiding",jn=".offcanvas.show",Mn=`show${Sn}`,Fn=`shown${Sn}`,Hn=`hide${Sn}`,Wn=`hidePrevented${Sn}`,Bn=`hidden${Sn}`,zn=`resize${Sn}`,Rn=`click${Sn}${Dn}`,qn=`keydown.dismiss${Sn}`,Vn={backdrop:!0,keyboard:!0,scroll:!1},Kn={backdrop:"(boolean|string)",keyboard:"boolean",scroll:"boolean"};class Qn extends B{constructor(t,e){super(t,e),this._isShown=!1,this._backdrop=this._initializeBackDrop(),this._focustrap=this._initializeFocusTrap(),this._addEventListeners();}static get Default(){return Vn}static get DefaultType(){return Kn}static get NAME(){return "offcanvas"}toggle(t){return this._isShown?this.hide():this.show(t)}show(t){this._isShown||P.trigger(this._element,Mn,{relatedTarget:t}).defaultPrevented||(this._isShown=!0,this._backdrop.show(),this._config.scroll||(new un).hide(),this._element.setAttribute("aria-modal",!0),this._element.setAttribute("role","dialog"),this._element.classList.add(Nn),this._queueCallback(()=>{this._config.scroll&&!this._config.backdrop||this._focustrap.activate(),this._element.classList.add(In),this._element.classList.remove(Nn),P.trigger(this._element,Fn,{relatedTarget:t});},this._element,!0));}hide(){this._isShown&&(P.trigger(this._element,Hn).defaultPrevented||(this._focustrap.deactivate(),this._element.blur(),this._isShown=!1,this._element.classList.add(Pn),this._backdrop.hide(),this._queueCallback(()=>{this._element.classList.remove(In,Pn),this._element.removeAttribute("aria-modal"),this._element.removeAttribute("role"),this._config.scroll||(new un).reset(),P.trigger(this._element,Bn);},this._element,!0)));}dispose(){this._backdrop.dispose(),this._focustrap.deactivate(),super.dispose();}_initializeBackDrop(){const t=Boolean(this._config.backdrop);return new Zi({className:"offcanvas-backdrop",isVisible:t,isAnimated:!0,rootElement:this._element.parentNode,clickCallback:t?()=>{"static"!==this._config.backdrop?this.hide():P.trigger(this._element,Wn);}:null})}_initializeFocusTrap(){return new an({trapElement:this._element})}_addEventListeners(){P.on(this._element,qn,t=>{"Escape"===t.key&&(this._config.keyboard?this.hide():P.trigger(this._element,Wn));});}static jQueryInterface(t){return this.each(function(){const e=Qn.getOrCreateInstance(this,t);if("string"==typeof t){if(void 0===e[t]||t.startsWith("_")||"constructor"===t)throw new TypeError(`No method named "${t}"`);e[t](this);}})}}P.on(document,Rn,'[data-bs-toggle="offcanvas"]',function(t){const e=R.getElementFromSelector(this);if(["A","AREA"].includes(this.tagName)&&t.preventDefault(),c(this))return;P.one(e,Bn,()=>{l(this)&&this.focus();});const i=R.findOne(jn);i&&i!==e&&Qn.getInstance(i).hide(),Qn.getOrCreateInstance(e).toggle(this);}),P.on(window,$n,()=>{for(const t of R.find(jn))Qn.getOrCreateInstance(t).show();}),P.on(window,zn,()=>{for(const t of R.find("[aria-modal][class*=show][class*=offcanvas-]"))"fixed"!==getComputedStyle(t).position&&Qn.getOrCreateInstance(t).hide();}),q(Qn),g(Qn);const Xn={"*":["class","dir","id","lang","role",/^aria-[\w-]*$/i],a:["target","href","title","rel"],area:[],b:[],br:[],col:[],code:[],dd:[],div:[],dl:[],dt:[],em:[],hr:[],h1:[],h2:[],h3:[],h4:[],h5:[],h6:[],i:[],img:["src","srcset","alt","title","width","height"],li:[],ol:[],p:[],pre:[],s:[],small:[],span:[],sub:[],sup:[],strong:[],u:[],ul:[]},Yn=new Set(["background","cite","href","itemtype","longdesc","poster","src","xlink:href"]),Un=/^(?!javascript:)(?:[a-z0-9+.-]+:|[^&:/?#]*(?:[/?#]|$))/i,Gn=(t,e)=>{const i=t.nodeName.toLowerCase();return e.includes(i)?!Yn.has(i)||Boolean(Un.test(t.nodeValue)):e.filter(t=>t instanceof RegExp).some(t=>t.test(i))},Jn={allowList:Xn,content:{},extraClass:"",html:!1,sanitize:!0,sanitizeFn:null,template:"<div></div>"},Zn={allowList:"object",content:"object",extraClass:"(string|function)",html:"boolean",sanitize:"boolean",sanitizeFn:"(null|function)",template:"string"},ts={entry:"(string|element|function|null)",selector:"(string|element)"};class es extends W{constructor(t){super(),this._config=this._getConfig(t);}static get Default(){return Jn}static get DefaultType(){return Zn}static get NAME(){return "TemplateFactory"}getContent(){return Object.values(this._config.content).map(t=>this._resolvePossibleFunction(t)).filter(Boolean)}hasContent(){return this.getContent().length>0}changeContent(t){return this._checkContent(t),this._config.content={...this._config.content,...t},this}toHtml(){const t=document.createElement("div");t.innerHTML=this._maybeSanitize(this._config.template);for(const[e,i]of Object.entries(this._config.content))this._setContent(t,i,e);const e=t.children[0],i=this._resolvePossibleFunction(this._config.extraClass);return i&&e.classList.add(...i.split(" ")),e}_typeCheckConfig(t){super._typeCheckConfig(t),this._checkContent(t.content);}_checkContent(t){for(const[e,i]of Object.entries(t))super._typeCheckConfig({selector:e,entry:i},ts);}_setContent(t,e,i){const n=R.findOne(i,t);n&&((e=this._resolvePossibleFunction(e))?r(e)?this._putElementInTemplate(a(e),n):this._config.html?n.innerHTML=this._maybeSanitize(e):n.textContent=e:n.remove());}_maybeSanitize(t){return this._config.sanitize?function(t,e,i){if(!t.length)return t;if(i&&"function"==typeof i)return i(t);const n=(new window.DOMParser).parseFromString(t,"text/html"),s=[].concat(...n.body.querySelectorAll("*"));for(const t of s){const i=t.nodeName.toLowerCase();if(!Object.keys(e).includes(i)){t.remove();continue}const n=[].concat(...t.attributes),s=[].concat(e["*"]||[],e[i]||[]);for(const e of n)Gn(e,s)||t.removeAttribute(e.nodeName);}return n.body.innerHTML}(t,this._config.allowList,this._config.sanitizeFn):t}_resolvePossibleFunction(t){return _(t,[void 0,this])}_putElementInTemplate(t,e){if(this._config.html)return e.innerHTML="",void e.append(t);e.textContent=t.textContent;}}const is=new Set(["sanitize","allowList","sanitizeFn"]),ns="fade",ss="show",os=".tooltip-inner",rs=".modal",as="hide.bs.modal",ls="hover",cs="focus",hs="click",ds={AUTO:"auto",TOP:"top",RIGHT:m()?"left":"right",BOTTOM:"bottom",LEFT:m()?"right":"left"},us={allowList:Xn,animation:!0,boundary:"clippingParents",container:!1,customClass:"",delay:0,fallbackPlacements:["top","right","bottom","left"],html:!1,offset:[0,6],placement:"top",popperConfig:null,sanitize:!0,sanitizeFn:null,selector:!1,template:'<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',title:"",trigger:"hover focus"},fs={allowList:"object",animation:"boolean",boundary:"(string|element)",container:"(string|element|boolean)",customClass:"(string|function)",delay:"(number|object)",fallbackPlacements:"array",html:"boolean",offset:"(array|string|function)",placement:"(string|function)",popperConfig:"(null|object|function)",sanitize:"boolean",sanitizeFn:"(null|function)",selector:"(string|boolean)",template:"string",title:"(string|element|function)",trigger:"string"};class ps extends B{constructor(t,e){if(void 0===Ai)throw new TypeError("Bootstrap's tooltips require Popper (https://popper.js.org/docs/v2/)");super(t,e),this._isEnabled=!0,this._timeout=0,this._isHovered=null,this._activeTrigger={},this._popper=null,this._templateFactory=null,this._newContent=null,this.tip=null,this._setListeners(),this._config.selector||this._fixTitle();}static get Default(){return us}static get DefaultType(){return fs}static get NAME(){return "tooltip"}enable(){this._isEnabled=!0;}disable(){this._isEnabled=!1;}toggleEnabled(){this._isEnabled=!this._isEnabled;}toggle(){this._isEnabled&&(this._isShown()?this._leave():this._enter());}dispose(){clearTimeout(this._timeout),P.off(this._element.closest(rs),as,this._hideModalHandler),this._element.getAttribute("data-bs-original-title")&&this._element.setAttribute("title",this._element.getAttribute("data-bs-original-title")),this._disposePopper(),super.dispose();}show(){if("none"===this._element.style.display)throw new Error("Please use show on visible elements");if(!this._isWithContent()||!this._isEnabled)return;const t=P.trigger(this._element,this.constructor.eventName("show")),e=(h(this._element)||this._element.ownerDocument.documentElement).contains(this._element);if(t.defaultPrevented||!e)return;this._disposePopper();const i=this._getTipElement();this._element.setAttribute("aria-describedby",i.getAttribute("id"));const{container:n}=this._config;if(this._element.ownerDocument.documentElement.contains(this.tip)||(n.append(i),P.trigger(this._element,this.constructor.eventName("inserted"))),this._popper=this._createPopper(i),i.classList.add(ss),"ontouchstart"in document.documentElement)for(const t of [].concat(...document.body.children))P.on(t,"mouseover",d);this._queueCallback(()=>{P.trigger(this._element,this.constructor.eventName("shown")),!1===this._isHovered&&this._leave(),this._isHovered=!1;},this.tip,this._isAnimated());}hide(){if(this._isShown()&&!P.trigger(this._element,this.constructor.eventName("hide")).defaultPrevented){if(this._getTipElement().classList.remove(ss),"ontouchstart"in document.documentElement)for(const t of [].concat(...document.body.children))P.off(t,"mouseover",d);this._activeTrigger[hs]=!1,this._activeTrigger[cs]=!1,this._activeTrigger[ls]=!1,this._isHovered=null,this._queueCallback(()=>{this._isWithActiveTrigger()||(this._isHovered||this._disposePopper(),this._element.removeAttribute("aria-describedby"),P.trigger(this._element,this.constructor.eventName("hidden")));},this.tip,this._isAnimated());}}update(){this._popper&&this._popper.update();}_isWithContent(){return Boolean(this._getTitle())}_getTipElement(){return this.tip||(this.tip=this._createTipElement(this._newContent||this._getContentForTemplate())),this.tip}_createTipElement(t){const e=this._getTemplateFactory(t).toHtml();if(!e)return null;e.classList.remove(ns,ss),e.classList.add(`bs-${this.constructor.NAME}-auto`);const i=(t=>{do{t+=Math.floor(1e6*Math.random());}while(document.getElementById(t));return t})(this.constructor.NAME).toString();return e.setAttribute("id",i),this._isAnimated()&&e.classList.add(ns),e}setContent(t){this._newContent=t,this._isShown()&&(this._disposePopper(),this.show());}_getTemplateFactory(t){return this._templateFactory?this._templateFactory.changeContent(t):this._templateFactory=new es({...this._config,content:t,extraClass:this._resolvePossibleFunction(this._config.customClass)}),this._templateFactory}_getContentForTemplate(){return {[os]:this._getTitle()}}_getTitle(){return this._resolvePossibleFunction(this._config.title)||this._element.getAttribute("data-bs-original-title")}_initializeOnDelegatedTarget(t){return this.constructor.getOrCreateInstance(t.delegateTarget,this._getDelegateConfig())}_isAnimated(){return this._config.animation||this.tip&&this.tip.classList.contains(ns)}_isShown(){return this.tip&&this.tip.classList.contains(ss)}_createPopper(t){const e=_(this._config.placement,[this,t,this._element]),i=ds[e.toUpperCase()];return wi(this._element,t,this._getPopperConfig(i))}_getOffset(){const{offset:t}=this._config;return "string"==typeof t?t.split(",").map(t=>Number.parseInt(t,10)):"function"==typeof t?e=>t(e,this._element):t}_resolvePossibleFunction(t){return _(t,[this._element,this._element])}_getPopperConfig(t){const e={placement:t,modifiers:[{name:"flip",options:{fallbackPlacements:this._config.fallbackPlacements}},{name:"offset",options:{offset:this._getOffset()}},{name:"preventOverflow",options:{boundary:this._config.boundary}},{name:"arrow",options:{element:`.${this.constructor.NAME}-arrow`}},{name:"preSetPlacement",enabled:!0,phase:"beforeMain",fn:t=>{this._getTipElement().setAttribute("data-popper-placement",t.state.placement);}}]};return {...e,..._(this._config.popperConfig,[void 0,e])}}_setListeners(){const t=this._config.trigger.split(" ");for(const e of t)if("click"===e)P.on(this._element,this.constructor.eventName("click"),this._config.selector,t=>{const e=this._initializeOnDelegatedTarget(t);e._activeTrigger[hs]=!(e._isShown()&&e._activeTrigger[hs]),e.toggle();});else if("manual"!==e){const t=e===ls?this.constructor.eventName("mouseenter"):this.constructor.eventName("focusin"),i=e===ls?this.constructor.eventName("mouseleave"):this.constructor.eventName("focusout");P.on(this._element,t,this._config.selector,t=>{const e=this._initializeOnDelegatedTarget(t);e._activeTrigger["focusin"===t.type?cs:ls]=!0,e._enter();}),P.on(this._element,i,this._config.selector,t=>{const e=this._initializeOnDelegatedTarget(t);e._activeTrigger["focusout"===t.type?cs:ls]=e._element.contains(t.relatedTarget),e._leave();});}this._hideModalHandler=()=>{this._element&&this.hide();},P.on(this._element.closest(rs),as,this._hideModalHandler);}_fixTitle(){const t=this._element.getAttribute("title");t&&(this._element.getAttribute("aria-label")||this._element.textContent.trim()||this._element.setAttribute("aria-label",t),this._element.setAttribute("data-bs-original-title",t),this._element.removeAttribute("title"));}_enter(){this._isShown()||this._isHovered?this._isHovered=!0:(this._isHovered=!0,this._setTimeout(()=>{this._isHovered&&this.show();},this._config.delay.show));}_leave(){this._isWithActiveTrigger()||(this._isHovered=!1,this._setTimeout(()=>{this._isHovered||this.hide();},this._config.delay.hide));}_setTimeout(t,e){clearTimeout(this._timeout),this._timeout=setTimeout(t,e);}_isWithActiveTrigger(){return Object.values(this._activeTrigger).includes(!0)}_getConfig(t){const e=H.getDataAttributes(this._element);for(const t of Object.keys(e))is.has(t)&&delete e[t];return t={...e,..."object"==typeof t&&t?t:{}},t=this._mergeConfigObj(t),t=this._configAfterMerge(t),this._typeCheckConfig(t),t}_configAfterMerge(t){return t.container=!1===t.container?document.body:a(t.container),"number"==typeof t.delay&&(t.delay={show:t.delay,hide:t.delay}),"number"==typeof t.title&&(t.title=t.title.toString()),"number"==typeof t.content&&(t.content=t.content.toString()),t}_getDelegateConfig(){const t={};for(const[e,i]of Object.entries(this._config))this.constructor.Default[e]!==i&&(t[e]=i);return t.selector=!1,t.trigger="manual",t}_disposePopper(){this._popper&&(this._popper.destroy(),this._popper=null),this.tip&&(this.tip.remove(),this.tip=null);}static jQueryInterface(t){return this.each(function(){const e=ps.getOrCreateInstance(this,t);if("string"==typeof t){if(void 0===e[t])throw new TypeError(`No method named "${t}"`);e[t]();}})}}g(ps);const ms=".popover-header",gs=".popover-body",_s={...ps.Default,content:"",offset:[0,8],placement:"right",template:'<div class="popover" role="tooltip"><div class="popover-arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>',trigger:"click"},bs={...ps.DefaultType,content:"(null|string|element|function)"};class vs extends ps{static get Default(){return _s}static get DefaultType(){return bs}static get NAME(){return "popover"}_isWithContent(){return this._getTitle()||this._getContent()}_getContentForTemplate(){return {[ms]:this._getTitle(),[gs]:this._getContent()}}_getContent(){return this._resolvePossibleFunction(this._config.content)}static jQueryInterface(t){return this.each(function(){const e=vs.getOrCreateInstance(this,t);if("string"==typeof t){if(void 0===e[t])throw new TypeError(`No method named "${t}"`);e[t]();}})}}g(vs);const ys=".bs.scrollspy",ws=`activate${ys}`,As=`click${ys}`,Es=`load${ys}.data-api`,Ts="active",Cs="[href]",Os=".nav-link",xs=`${Os}, .nav-item > ${Os}, .list-group-item`,ks={offset:null,rootMargin:"0px 0px -25%",smoothScroll:!1,target:null,threshold:[.1,.5,1]},Ls={offset:"(number|null)",rootMargin:"string",smoothScroll:"boolean",target:"element",threshold:"array"};class Ss extends B{constructor(t,e){super(t,e),this._targetLinks=new Map,this._observableSections=new Map,this._rootElement="visible"===getComputedStyle(this._element).overflowY?null:this._element,this._activeTarget=null,this._observer=null,this._previousScrollData={visibleEntryTop:0,parentScrollTop:0},this.refresh();}static get Default(){return ks}static get DefaultType(){return Ls}static get NAME(){return "scrollspy"}refresh(){this._initializeTargetsAndObservables(),this._maybeEnableSmoothScroll(),this._observer?this._observer.disconnect():this._observer=this._getNewObserver();for(const t of this._observableSections.values())this._observer.observe(t);}dispose(){this._observer.disconnect(),super.dispose();}_configAfterMerge(t){return t.target=a(t.target)||document.body,t.rootMargin=t.offset?`${t.offset}px 0px -30%`:t.rootMargin,"string"==typeof t.threshold&&(t.threshold=t.threshold.split(",").map(t=>Number.parseFloat(t))),t}_maybeEnableSmoothScroll(){this._config.smoothScroll&&(P.off(this._config.target,As),P.on(this._config.target,As,Cs,t=>{const e=this._observableSections.get(t.target.hash);if(e){t.preventDefault();const i=this._rootElement||window,n=e.offsetTop-this._element.offsetTop;if(i.scrollTo)return void i.scrollTo({top:n,behavior:"smooth"});i.scrollTop=n;}}));}_getNewObserver(){const t={root:this._rootElement,threshold:this._config.threshold,rootMargin:this._config.rootMargin};return new IntersectionObserver(t=>this._observerCallback(t),t)}_observerCallback(t){const e=t=>this._targetLinks.get(`#${t.target.id}`),i=t=>{this._previousScrollData.visibleEntryTop=t.target.offsetTop,this._process(e(t));},n=(this._rootElement||document.documentElement).scrollTop,s=n>=this._previousScrollData.parentScrollTop;this._previousScrollData.parentScrollTop=n;for(const o of t){if(!o.isIntersecting){this._activeTarget=null,this._clearActiveClass(e(o));continue}const t=o.target.offsetTop>=this._previousScrollData.visibleEntryTop;if(s&&t){if(i(o),!n)return}else s||t||i(o);}}_initializeTargetsAndObservables(){this._targetLinks=new Map,this._observableSections=new Map;const t=R.find(Cs,this._config.target);for(const e of t){if(!e.hash||c(e))continue;const t=R.findOne(decodeURI(e.hash),this._element);l(t)&&(this._targetLinks.set(decodeURI(e.hash),e),this._observableSections.set(e.hash,t));}}_process(t){this._activeTarget!==t&&(this._clearActiveClass(this._config.target),this._activeTarget=t,t.classList.add(Ts),this._activateParents(t),P.trigger(this._element,ws,{relatedTarget:t}));}_activateParents(t){if(t.classList.contains("dropdown-item"))R.findOne(".dropdown-toggle",t.closest(".dropdown")).classList.add(Ts);else for(const e of R.parents(t,".nav, .list-group"))for(const t of R.prev(e,xs))t.classList.add(Ts);}_clearActiveClass(t){t.classList.remove(Ts);const e=R.find(`${Cs}.${Ts}`,t);for(const t of e)t.classList.remove(Ts);}static jQueryInterface(t){return this.each(function(){const e=Ss.getOrCreateInstance(this,t);if("string"==typeof t){if(void 0===e[t]||t.startsWith("_")||"constructor"===t)throw new TypeError(`No method named "${t}"`);e[t]();}})}}P.on(window,Es,()=>{for(const t of R.find('[data-bs-spy="scroll"]'))Ss.getOrCreateInstance(t);}),g(Ss);const Ds=".bs.tab",$s=`hide${Ds}`,Is=`hidden${Ds}`,Ns=`show${Ds}`,Ps=`shown${Ds}`,js=`click${Ds}`,Ms=`keydown${Ds}`,Fs=`load${Ds}`,Hs="ArrowLeft",Ws="ArrowRight",Bs="ArrowUp",zs="ArrowDown",Rs="Home",qs="End",Vs="active",Ks="fade",Qs="show",Xs=".dropdown-toggle",Ys=`:not(${Xs})`,Us='[data-bs-toggle="tab"], [data-bs-toggle="pill"], [data-bs-toggle="list"]',Gs=`.nav-link${Ys}, .list-group-item${Ys}, [role="tab"]${Ys}, ${Us}`,Js=`.${Vs}[data-bs-toggle="tab"], .${Vs}[data-bs-toggle="pill"], .${Vs}[data-bs-toggle="list"]`;class Zs extends B{constructor(t){super(t),this._parent=this._element.closest('.list-group, .nav, [role="tablist"]'),this._parent&&(this._setInitialAttributes(this._parent,this._getChildren()),P.on(this._element,Ms,t=>this._keydown(t)));}static get NAME(){return "tab"}show(){const t=this._element;if(this._elemIsActive(t))return;const e=this._getActiveElem(),i=e?P.trigger(e,$s,{relatedTarget:t}):null;P.trigger(t,Ns,{relatedTarget:e}).defaultPrevented||i&&i.defaultPrevented||(this._deactivate(e,t),this._activate(t,e));}_activate(t,e){t&&(t.classList.add(Vs),this._activate(R.getElementFromSelector(t)),this._queueCallback(()=>{"tab"===t.getAttribute("role")?(t.removeAttribute("tabindex"),t.setAttribute("aria-selected",!0),this._toggleDropDown(t,!0),P.trigger(t,Ps,{relatedTarget:e})):t.classList.add(Qs);},t,t.classList.contains(Ks)));}_deactivate(t,e){t&&(t.classList.remove(Vs),t.blur(),this._deactivate(R.getElementFromSelector(t)),this._queueCallback(()=>{"tab"===t.getAttribute("role")?(t.setAttribute("aria-selected",!1),t.setAttribute("tabindex","-1"),this._toggleDropDown(t,!1),P.trigger(t,Is,{relatedTarget:e})):t.classList.remove(Qs);},t,t.classList.contains(Ks)));}_keydown(t){if(![Hs,Ws,Bs,zs,Rs,qs].includes(t.key))return;t.stopPropagation(),t.preventDefault();const e=this._getChildren().filter(t=>!c(t));let i;if([Rs,qs].includes(t.key))i=e[t.key===Rs?0:e.length-1];else {const n=[Ws,zs].includes(t.key);i=v(e,t.target,n,!0);}i&&(i.focus({preventScroll:!0}),Zs.getOrCreateInstance(i).show());}_getChildren(){return R.find(Gs,this._parent)}_getActiveElem(){return this._getChildren().find(t=>this._elemIsActive(t))||null}_setInitialAttributes(t,e){this._setAttributeIfNotExists(t,"role","tablist");for(const t of e)this._setInitialAttributesOnChild(t);}_setInitialAttributesOnChild(t){t=this._getInnerElement(t);const e=this._elemIsActive(t),i=this._getOuterElement(t);t.setAttribute("aria-selected",e),i!==t&&this._setAttributeIfNotExists(i,"role","presentation"),e||t.setAttribute("tabindex","-1"),this._setAttributeIfNotExists(t,"role","tab"),this._setInitialAttributesOnTargetPanel(t);}_setInitialAttributesOnTargetPanel(t){const e=R.getElementFromSelector(t);e&&(this._setAttributeIfNotExists(e,"role","tabpanel"),t.id&&this._setAttributeIfNotExists(e,"aria-labelledby",`${t.id}`));}_toggleDropDown(t,e){const i=this._getOuterElement(t);if(!i.classList.contains("dropdown"))return;const n=(t,n)=>{const s=R.findOne(t,i);s&&s.classList.toggle(n,e);};n(Xs,Vs),n(".dropdown-menu",Qs),i.setAttribute("aria-expanded",e);}_setAttributeIfNotExists(t,e,i){t.hasAttribute(e)||t.setAttribute(e,i);}_elemIsActive(t){return t.classList.contains(Vs)}_getInnerElement(t){return t.matches(Gs)?t:R.findOne(Gs,t)}_getOuterElement(t){return t.closest(".nav-item, .list-group-item")||t}static jQueryInterface(t){return this.each(function(){const e=Zs.getOrCreateInstance(this);if("string"==typeof t){if(void 0===e[t]||t.startsWith("_")||"constructor"===t)throw new TypeError(`No method named "${t}"`);e[t]();}})}}P.on(document,js,Us,function(t){["A","AREA"].includes(this.tagName)&&t.preventDefault(),c(this)||Zs.getOrCreateInstance(this).show();}),P.on(window,Fs,()=>{for(const t of R.find(Js))Zs.getOrCreateInstance(t);}),g(Zs);const to=".bs.toast",eo=`mouseover${to}`,io=`mouseout${to}`,no=`focusin${to}`,so=`focusout${to}`,oo=`hide${to}`,ro=`hidden${to}`,ao=`show${to}`,lo=`shown${to}`,co="hide",ho="show",uo="showing",fo={animation:"boolean",autohide:"boolean",delay:"number"},po={animation:!0,autohide:!0,delay:5e3};class mo extends B{constructor(t,e){super(t,e),this._timeout=null,this._hasMouseInteraction=!1,this._hasKeyboardInteraction=!1,this._setListeners();}static get Default(){return po}static get DefaultType(){return fo}static get NAME(){return "toast"}show(){P.trigger(this._element,ao).defaultPrevented||(this._clearTimeout(),this._config.animation&&this._element.classList.add("fade"),this._element.classList.remove(co),u(this._element),this._element.classList.add(ho,uo),this._queueCallback(()=>{this._element.classList.remove(uo),P.trigger(this._element,lo),this._maybeScheduleHide();},this._element,this._config.animation));}hide(){this.isShown()&&(P.trigger(this._element,oo).defaultPrevented||(this._element.classList.add(uo),this._queueCallback(()=>{this._element.classList.add(co),this._element.classList.remove(uo,ho),P.trigger(this._element,ro);},this._element,this._config.animation)));}dispose(){this._clearTimeout(),this.isShown()&&this._element.classList.remove(ho),super.dispose();}isShown(){return this._element.classList.contains(ho)}_maybeScheduleHide(){this._config.autohide&&(this._hasMouseInteraction||this._hasKeyboardInteraction||(this._timeout=setTimeout(()=>{this.hide();},this._config.delay)));}_onInteraction(t,e){switch(t.type){case"mouseover":case"mouseout":this._hasMouseInteraction=e;break;case"focusin":case"focusout":this._hasKeyboardInteraction=e;}if(e)return void this._clearTimeout();const i=t.relatedTarget;this._element===i||this._element.contains(i)||this._maybeScheduleHide();}_setListeners(){P.on(this._element,eo,t=>this._onInteraction(t,!0)),P.on(this._element,io,t=>this._onInteraction(t,!1)),P.on(this._element,no,t=>this._onInteraction(t,!0)),P.on(this._element,so,t=>this._onInteraction(t,!1));}_clearTimeout(){clearTimeout(this._timeout),this._timeout=null;}static jQueryInterface(t){return this.each(function(){const e=mo.getOrCreateInstance(this,t);if("string"==typeof t){if(void 0===e[t])throw new TypeError(`No method named "${t}"`);e[t](this);}})}}return q(mo),g(mo),{Alert:X,Button:U,Carousel:St,Collapse:qt,Dropdown:Qi,Modal:Ln,Offcanvas:Qn,Popover:vs,ScrollSpy:Ss,Tab:Zs,Toast:mo,Tooltip:ps}});
    	
    } (bootstrap_bundle_min));

    const app = new App({
    	target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
