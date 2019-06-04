# Steps take to mitigate issues found in output.txt

## output.txt line 23 `Title: (SWC-107) Reentrancy`
**description:**
```
Severity: Medium
Head: A call to a user-supplied address is executed.
Description: The callee address of an external message call can be set by the caller. Note that the callee can contain arbitrary code and may re-enter any function in this contract. Review the business logic carefully to prevent averse effects on the contract state.
Source code:

./contracts/status/sticker-market/StickerMarket.sol 356:8
--------------------------------------------------
token.transfer(controller, balance)
--------------------------------------------------
```
**mitigation:**  
None.  This is an `ownlyOwner` modified function.  The owner will not use a re-entrancy attack in this context.  It is benign. 

## output.txt line 36 `Title: (SWC-110) Assert Violation`
**description:**
```
Severity: Low
Head: A reachable exception has been detected.
Description: It is possible to trigger an exception (opcode 0xfe). Exceptions can be caused by type errors, division by zero, out-of-bounds array access, or assert violations. Note that explicit `assert()` should only be used to check invariants. Use `require()` for regular input checking.
Source code:

./contracts/status/sticker-market/StickerMarket.sol 273:8
--------------------------------------------------
state = _state
--------------------------------------------------
**mitigation:**
None.  This is an `ownlyOwner` modified function.  We can assume that the owner controlled functions will be called with the correct state. 
```
## output.txt line 49: `Title: (SWC-110) Assert Violation`
**description:**
```
Severity: Low
Head: A reachable exception has been detected.
Description: It is possible to trigger an exception (opcode 0xfe). Exceptions can be caused by type errors, division by zero, out-of-bounds array access, or assert violations. Note that explicit `assert()` should only be used to check invariants. Use `require()` for regular input checking.
Source code:

./contracts/status/sticker-market/StickerMarket.sol 393:17
--------------------------------------------------
availablePacks[_category][_index]
--------------------------------------------------
```
**mitigation:**
