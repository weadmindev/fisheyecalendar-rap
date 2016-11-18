package com.weadmin.piccolo2d_rap.example;

import org.eclipse.rap.rwt.application.AbstractEntryPoint;
import org.eclipse.swt.SWT;
import org.eclipse.swt.widgets.Composite;

import com.weadmin.piccolo2d_rap.Piccolo2dJS;

public class ExampleOne extends AbstractEntryPoint{

	@Override
	protected void createContents(Composite parent) {
		parent.setLayout(null);
		Piccolo2dJS pjs = new Piccolo2dJS(parent, SWT.NONE);
		pjs.setBounds(20, 0, 1000, 600);
		pjs.showText("Hello World!");
	}

}
