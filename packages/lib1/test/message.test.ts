import { getMessage } from "../src/message";

describe("message tests", () => {
  it("should return the expected message", () => {
    expect(getMessage()).toBe("Message from @benr-ts-experiment/lib1");
  });
});
