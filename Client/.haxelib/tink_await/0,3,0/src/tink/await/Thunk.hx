package tink.await;

abstract Thunk<T>(ThunkData<T>) from ThunkData<T> to ThunkData<T> {
	
	inline function new(data: ThunkData<T>)
		this = data;
		
	@:from public static inline function fromCont<T>(thunk: Void -> Thunk<T>): Thunk<T>
		return new Thunk(Cont(thunk));
		
	@:from public static inline function fromCall<T>(thunk: Void -> T): Thunk<T>
		return new Thunk(Call(thunk));
		
	@:from public static inline function fromValue<T>(value: T): Thunk<T>
		return new Thunk(Done(value));
		
	@:to public inline function toT(): T {
		var result: T, part: ThunkData<T> = this;
		while(true) switch part {
			case Cont(thunk):
				part = thunk();
			case Call(thunk):
				result = thunk();
				break;
			case Done(v):
				result = v;
				break;
		}
		return result;
	}
}

enum ThunkData<T> {
	Cont(thunk: Void -> Thunk<T>);
	Call(thunk: Void -> T);
	Done(value: T);
}