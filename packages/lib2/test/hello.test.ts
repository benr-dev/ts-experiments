
import { sayHello } from "../src/hello";

describe("message tests", () => {
  it("should return the expected message", () => {
    expect(sayHello()).toMatch(/Hello .*/);
  });
});
